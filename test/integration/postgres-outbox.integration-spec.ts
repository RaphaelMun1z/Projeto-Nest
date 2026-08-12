import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DocumentEntity } from '../../src/db/entities/document.entity';
import { OutboxEventEntity } from '../../src/db/entities/outbox-event.entity';

const runInfrastructureTests = process.env.RUN_INFRA_TESTS === '1';

(runInfrastructureTests ? describe : describe.skip)(
    'PostgreSQL outbox integration',
    () => {
        let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
        let dataSource: DataSource;

        beforeAll(async () => {
            container = await new PostgreSqlContainer('postgres:17').start();
            dataSource = new DataSource({
                type: 'postgres',
                host: container.getHost(),
                port: container.getPort(),
                username: container.getUsername(),
                password: container.getPassword(),
                database: container.getDatabase(),
                entities: [DocumentEntity, OutboxEventEntity],
                synchronize: true,
            });
            await dataSource.initialize();
        }, 120_000);

        afterAll(async () => {
            await dataSource?.destroy();
            await container?.stop();
        }, 120_000);

        it('persiste documento e evento na mesma base', async () => {
            const document = await dataSource
                .getRepository(DocumentEntity)
                .save({
                    fileName: 'integration.pdf',
                    sizeBytes: 10,
                    sections: [],
                    disciplina: 'D',
                    universidade: 'U',
                    ano_curriculo: 2026,
                    description: null,
                });

            const event = await dataSource
                .getRepository(OutboxEventEntity)
                .save({
                    aggregateId: document.id,
                    eventId: randomUUID(),
                    eventType: 'document.extracted.v1',
                    payload: { documentId: document.id },
                    status: 'pending',
                    attempts: 0,
                    availableAt: new Date(),
                    lastError: null,
                });

            expect(event.aggregateId).toBe(document.id);
            await expect(
                dataSource.getRepository(OutboxEventEntity).findOneBy({
                    eventId: event.eventId,
                }),
            ).resolves.toMatchObject({ status: 'pending' });
        });
    },
);
