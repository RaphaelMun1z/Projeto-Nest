import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutboxLock1786480257028 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE tb_outbox_events ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMPTZ;`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_outbox_claimable" ON tb_outbox_events ("status", "available_at", "locked_at");`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_outbox_claimable";`);
        await queryRunner.query(
            `ALTER TABLE tb_outbox_events DROP COLUMN IF EXISTS "locked_at";`,
        );
    }
}
