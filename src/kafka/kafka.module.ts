import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
    DOCUMENT_EXTRACTED_TOPIC,
    DOCUMENT_EXTRACTION_TOPIC,
    KAFKA_CLIENT,
} from './kafka.constants';
import { DocumentEventProducer } from './document-event-producer.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: KAFKA_CLIENT,
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => {
                    const kafka = configService.getOrThrow<{
                        clientId: string;
                        brokers: string[];
                    }>('kafka');

                    return {
                        transport: Transport.KAFKA,
                        options: {
                            client: {
                                clientId: kafka.clientId,
                                brokers: kafka.brokers,
                            },
                            producer: {
                                allowAutoTopicCreation: true,
                            },
                        },
                    };
                },
            },
        ]),
    ],
    providers: [
        DocumentEventProducer,
        {
            provide: DOCUMENT_EXTRACTED_TOPIC,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                configService.getOrThrow<string>('kafka.documentTopic'),
        },
        {
            provide: DOCUMENT_EXTRACTION_TOPIC,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                configService.getOrThrow<string>('kafka.extractionTopic'),
        },
    ],
    exports: [DocumentEventProducer],
})
export class KafkaModule {}
