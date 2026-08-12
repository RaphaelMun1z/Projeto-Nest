import { MigrationInterface, QueryRunner } from 'typeorm';

export class AsyncDocumentProcessing1786480257029 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE tb_documents
                ADD COLUMN IF NOT EXISTS "pages" integer,
                ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'pending',
                ADD COLUMN IF NOT EXISTS "processing_error" text,
                ADD COLUMN IF NOT EXISTS "pdf_data" bytea;
        `);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_documents_status" ON tb_documents ("status");`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE tb_documents
                DROP COLUMN IF EXISTS "pdf_data",
                DROP COLUMN IF EXISTS "processing_error",
                DROP COLUMN IF EXISTS "status",
                DROP COLUMN IF EXISTS "pages";
        `);
    }
}
