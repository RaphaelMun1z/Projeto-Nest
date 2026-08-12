import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DocumentEntity } from '../db/entities/document.entity';
import { OutboxEventEntity } from '../db/entities/outbox-event.entity';
import { DocumentEventProducer } from '../kafka/document-event-producer.service';
import {
    DOCUMENT_EXTRACTED_EVENT,
    DocumentExtractedEvent,
} from '../kafka/events/document-extracted.event';
import { ExtractedPdfResDTO } from './document.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DocumentOutboxService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DocumentOutboxService.name);
    /**
     * A outbox precisa acompanhar o ritmo de entrada dos uploads. O lock
     * pessimista em claimNextEvent continua garantindo que várias réplicas
     * não processem o mesmo evento.
     */
    private readonly pollIntervalMs = 250;
    private readonly batchSize = 25;
    private readonly lockTimeoutMs = 60_000;
    private processing = false;
    private poller?: ReturnType<typeof setInterval>;

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(OutboxEventEntity)
        private readonly outboxRepository: Repository<OutboxEventEntity>,
        private readonly producer: DocumentEventProducer,
    ) {}

    onModuleInit(): void {
        this.poller = setInterval(() => {
            void this.processPendingEvents();
        }, this.pollIntervalMs);
        void this.processPendingEvents();
    }

    onModuleDestroy(): void {
        if (this.poller) {
            clearInterval(this.poller);
        }
    }

    async saveDocumentWithEvent(
        document: DocumentEntity,
        extracted: ExtractedPdfResDTO,
    ): Promise<DocumentEntity> {
        const eventId = randomUUID();

        return this.dataSource.transaction(async (manager) => {
            const savedDocument = await manager.save(DocumentEntity, document);
            const payload: DocumentExtractedEvent = {
                eventId,
                eventType: DOCUMENT_EXTRACTED_EVENT,
                occurredAt: new Date().toISOString(),
                documentId: savedDocument.id,
                fileName: extracted.fileName,
                sizeBytes: extracted.sizeBytes,
                pages: extracted.pages,
                sections: extracted.sections,
            };

            await manager.save(OutboxEventEntity, {
                aggregateId: savedDocument.id,
                eventId,
                eventType: payload.eventType,
                payload: payload as unknown as Record<string, unknown>,
                status: 'pending',
                attempts: 0,
                availableAt: new Date(),
                lastError: null,
                lockedAt: null,
            });

            return savedDocument;
        });
    }

    async saveDocumentForExtraction(
        document: DocumentEntity,
        eventId: string,
    ): Promise<DocumentEntity> {
        return this.dataSource.transaction(async (manager) => {
            const savedDocument = await manager.save(DocumentEntity, document);
            const payload = {
                eventId,
                eventType: 'document.extraction.requested.v1',
                occurredAt: new Date().toISOString(),
                documentId: savedDocument.id,
            };

            await manager.save(OutboxEventEntity, {
                aggregateId: savedDocument.id,
                eventId,
                eventType: payload.eventType,
                payload,
                status: 'pending',
                attempts: 0,
                availableAt: new Date(),
                lastError: null,
                lockedAt: null,
            });

            return savedDocument;
        });
    }

    private async processPendingEvents(): Promise<void> {
        if (this.processing) {
            return;
        }

        this.processing = true;

        try {
            for (let processed = 0; processed < this.batchSize; processed += 1) {
                const event = await this.claimNextEvent();

                if (!event) {
                    break;
                }

                await this.publishEvent(event);
            }
        } catch (error) {
            this.logger.error(
                'Falha ao processar a outbox',
                error instanceof Error ? error.stack : String(error),
            );
        } finally {
            this.processing = false;
        }
    }

    private async publishEvent(event: OutboxEventEntity): Promise<void> {
        try {
            if (event.eventType === 'document.extraction.requested.v1') {
                await this.producer.publishExtractionRequested(
                    event.aggregateId,
                    event.eventId,
                );
            } else {
                await this.producer.publishWithRetry(
                    event.payload as unknown as DocumentExtractedEvent,
                );
            }

            await this.outboxRepository.update(event.id, {
                status: 'published',
                lastError: null,
                lockedAt: null,
            });
        } catch (error) {
            const lastError =
                error instanceof Error ? error.message : String(error);
            await this.outboxRepository.update(event.id, {
                status: 'dead-letter',
                lastError,
                lockedAt: null,
            });
            this.logger.error(
                `Evento movido para dead-letter: eventId=${event.eventId}`,
                lastError,
            );
        }
    }

    /**
     * Claims one event atomically. FOR UPDATE SKIP LOCKED lets multiple pods
     * consume the outbox concurrently without selecting the same row.
     */
    private async claimNextEvent(): Promise<OutboxEventEntity | null> {
        const now = new Date();
        const expiredLock = new Date(now.getTime() - this.lockTimeoutMs);

        return this.dataSource.transaction(async (manager) => {
            const event = await manager
                .getRepository(OutboxEventEntity)
                .createQueryBuilder('event')
                .where(
                    `(
                        event.status = :pending
                        AND event.available_at <= :now
                    )
                    OR (
                        event.status = :processing
                        AND (
                            event.locked_at IS NULL
                            OR event.locked_at <= :expiredLock
                        )
                    )`,
                    {
                        pending: 'pending',
                        processing: 'processing',
                        now,
                        expiredLock,
                    },
                )
                .orderBy('event.created_at', 'ASC')
                .setLock('pessimistic_write')
                .setOnLocked('skip_locked')
                .getOne();

            if (!event) {
                return null;
            }

            event.status = 'processing';
            event.attempts += 1;
            event.lockedAt = now;

            return manager.save(OutboxEventEntity, event);
        });
    }
}
