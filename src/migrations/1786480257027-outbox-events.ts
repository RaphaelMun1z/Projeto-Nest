import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutboxEvents1786480257027 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE tb_outbox_events (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "aggregate_id" uuid NOT NULL,
            "event_id" uuid NOT NULL,
            "event_type" character varying(100) NOT NULL,
            "payload" jsonb NOT NULL,
            "status" character varying(20) NOT NULL DEFAULT 'pending',
            "attempts" integer NOT NULL DEFAULT 0,
            "available_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
            "last_error" text,
            "locked_at" TIMESTAMPTZ,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT "PK_outbox_event_id" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_outbox_event_id" UNIQUE ("event_id")
        );`);

        await queryRunner.query(
            `CREATE INDEX "IDX_outbox_pending" ON tb_outbox_events ("status", "available_at");`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tb_outbox_events;`);
    }
}
