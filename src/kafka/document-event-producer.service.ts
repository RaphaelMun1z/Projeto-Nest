import {
    Inject,
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { DOCUMENT_EXTRACTED_TOPIC, KAFKA_CLIENT } from './kafka.constants';
import {
    DOCUMENT_EXTRACTED_EVENT,
    DocumentExtractedEvent,
} from './events/document-extracted.event';

const MAX_PUBLISH_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 500;

@Injectable()
export class DocumentEventProducer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DocumentEventProducer.name);

    constructor(
        @Inject(KAFKA_CLIENT) private readonly client: ClientKafka,
        @Inject(DOCUMENT_EXTRACTED_TOPIC) private readonly topic: string,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.client.connect();
        this.logger.log(`Kafka conectado; tópico: ${this.topic}`);
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.close();
        this.logger.log('Conexão Kafka encerrada');
    }

    async publishDocumentExtracted(params: {
        documentId: string;
        fileName: string;
        sizeBytes: number;
        pages: number;
        sections: DocumentExtractedEvent['sections'];
    }): Promise<void> {
        const event: DocumentExtractedEvent = {
            eventId: randomUUID(),
            eventType: DOCUMENT_EXTRACTED_EVENT,
            occurredAt: new Date().toISOString(),
            ...params,
        };

        try {
            await this.publishWithRetry(event);
        } catch (error) {
            this.logger.error(
                `Falha ao publicar evento ${event.eventType} para ${event.documentId}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }

        this.logger.debug(
            `Evento ${event.eventType} publicado para ${event.documentId}`,
        );
    }

    async publishWithRetry(event: DocumentExtractedEvent): Promise<void> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= MAX_PUBLISH_ATTEMPTS; attempt++) {
            try {
                await firstValueFrom(
                    this.client.emit(this.topic, {
                        key: event.documentId,
                        value: event,
                        headers: {
                            eventType: event.eventType,
                            eventId: event.eventId,
                            attempt: String(attempt),
                        },
                    }),
                );
                return;
            } catch (error) {
                lastError = error;

                if (attempt < MAX_PUBLISH_ATTEMPTS) {
                    await this.delay(
                        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
                    );
                }
            }
        }

        this.logger.error(
            `Publicação esgotou ${MAX_PUBLISH_ATTEMPTS} tentativas: eventId=${event.eventId}`,
            lastError instanceof Error ? lastError.stack : String(lastError),
        );

        await this.publishToDeadLetter(event, lastError);
        throw lastError;
    }

    private async publishToDeadLetter(
        event: DocumentExtractedEvent,
        error: unknown,
    ): Promise<void> {
        const deadLetterTopic = `${this.topic}.DLT`;

        await firstValueFrom(
            this.client.emit(deadLetterTopic, {
                key: event.documentId,
                value: {
                    ...event,
                    failure:
                        error instanceof Error ? error.message : String(error),
                },
                headers: {
                    eventType: event.eventType,
                    eventId: event.eventId,
                },
            }),
        );

        this.logger.warn(`Evento enviado para DLT: eventId=${event.eventId}`);
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
