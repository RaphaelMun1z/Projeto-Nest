import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
    clientId: process.env.KAFKA_CLIENT_ID ?? 'document-service',
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092,localhost:9094')
        .split(',')
        .map((broker) => broker.trim())
        .filter(Boolean),
    documentTopic: process.env.KAFKA_DOCUMENT_TOPIC ?? 'document.extracted.v1',
    extractionTopic:
        process.env.KAFKA_EXTRACTION_TOPIC ?? 'document.extraction.requested.v1',
    workerGroupId:
        process.env.KAFKA_WORKER_GROUP_ID ?? 'document-extraction-worker',
}));
