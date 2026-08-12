import { randomUUID } from 'node:crypto';
import { Kafka } from 'kafkajs';

const runInfrastructureTests = process.env.RUN_INFRA_TESTS === '1';

(runInfrastructureTests ? describe : describe.skip)('Kafka integration', () => {
    const brokers = (
        process.env.KAFKA_BROKERS ?? 'localhost:9092,localhost:9094'
    )
        .split(',')
        .map((broker) => broker.trim())
        .filter(Boolean);
    const topic = process.env.KAFKA_DOCUMENT_TOPIC ?? 'document.extracted.v1';
    const kafka = new Kafka({ clientId: 'document-service-test', brokers });
    const producer = kafka.producer();

    beforeAll(async () => {
        await producer.connect();
    }, 30_000);

    afterAll(async () => {
        await producer.disconnect();
    }, 30_000);

    it('publica um evento no tópico configurado', async () => {
        const documentId = randomUUID();

        await expect(
            producer.send({
                topic,
                messages: [
                    {
                        key: documentId,
                        value: JSON.stringify({
                            eventId: randomUUID(),
                            eventType: 'document.extracted.v1',
                            documentId,
                        }),
                    },
                ],
            }),
        ).resolves.toBeDefined();
    }, 30_000);
});
