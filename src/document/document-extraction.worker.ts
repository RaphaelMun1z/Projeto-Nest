import {
    Injectable,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kafka, Consumer } from 'kafkajs';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { DocumentEntity } from '../db/entities/document.entity';
import { OutboxEventEntity } from '../db/entities/outbox-event.entity';
import { PdfTextExtractor } from './pdf-extraction.service';
import {
    DOCUMENT_EXTRACTED_EVENT,
    DocumentExtractedEvent,
} from '../kafka/events/document-extracted.event';
import { getRuntimeInstanceName } from '../config/runtime-instance';

interface ExtractionRequest {
    eventId: string;
    documentId: string;
}

@Injectable()
export class DocumentExtractionWorker implements OnModuleDestroy {
    private readonly logger = new Logger(DocumentExtractionWorker.name);
    private consumer?: Consumer;

    constructor(
        private readonly config: ConfigService,
        private readonly dataSource: DataSource,
        private readonly extractor: PdfTextExtractor,
        @InjectRepository(DocumentEntity)
        private readonly documents: Repository<DocumentEntity>,
    ) {}

    async start(): Promise<void> {
        const kafka = this.config.getOrThrow<{
            clientId: string;
            brokers: string[];
            extractionTopic: string;
            workerGroupId: string;
        }>('kafka');
        const client = new Kafka({ clientId: `${kafka.clientId}-worker`, brokers: kafka.brokers });
        this.consumer = client.consumer({ groupId: kafka.workerGroupId });
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: kafka.extractionTopic, fromBeginning: false });
        this.logger.log(`Worker de extração conectado: instancia=${getRuntimeInstanceName()}`);
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;
                const request = JSON.parse(message.value.toString()) as ExtractionRequest;
                await this.process(request);
            },
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.consumer?.disconnect();
    }

    private async process(request: ExtractionRequest): Promise<void> {
        const document = await this.claim(request.documentId);
        if (!document) return;

        try {
            const file = {
                fieldname: 'file',
                originalname: document.fileName,
                encoding: '7bit',
                mimetype: 'application/pdf',
                size: document.pdfData!.length,
                buffer: document.pdfData!,
                destination: '',
                filename: document.fileName,
                path: '',
                stream: Readable.from(document.pdfData!),
            } as Express.Multer.File;
            const extracted = await this.extractor.extract(file);
            await this.dataSource.transaction(async (manager) => {
                await manager.update(DocumentEntity, document.id, {
                    sections: extracted.sections,
                    pages: extracted.pages,
                    status: 'completed',
                    processingError: null,
                    pdfData: null,
                });
                const event: DocumentExtractedEvent = {
                    eventId: randomUUID(),
                    eventType: DOCUMENT_EXTRACTED_EVENT,
                    occurredAt: new Date().toISOString(),
                    documentId: document.id,
                    fileName: document.fileName,
                    sizeBytes: document.sizeBytes,
                    pages: extracted.pages,
                    sections: extracted.sections,
                };
                await manager.save(OutboxEventEntity, {
                    aggregateId: document.id,
                    eventId: randomUUID(),
                    eventType: event.eventType,
                    payload: event as unknown as Record<string, unknown>,
                    status: 'pending',
                    attempts: 0,
                    availableAt: new Date(),
                    lastError: null,
                    lockedAt: null,
                });
            });
            this.logger.log(`PDF processado: documentId=${document.id}, instancia=${getRuntimeInstanceName()}`);
        } catch (error) {
            await this.documents.update(document.id, {
                status: 'failed',
                processingError: error instanceof Error ? error.message : String(error),
            });
            this.logger.error(`Falha no PDF: documentId=${document.id}`, error instanceof Error ? error.stack : String(error));
        }
    }

    private async claim(documentId: string): Promise<DocumentEntity | null> {
        return this.dataSource.transaction(async (manager) => {
            const repository = manager.getRepository(DocumentEntity);
            const document = await repository
                .createQueryBuilder('document')
                .addSelect('document.pdfData')
                .where('document.id = :documentId', { documentId })
                .andWhere('document.status = :status', { status: 'pending' })
                .setLock('pessimistic_write')
                .getOne();
            if (!document) return null;
            document.status = 'processing';
            return repository.save(document);
        });
    }
}
