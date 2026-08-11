import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentTable1786480257026 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE tb_documents (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "file_name" character varying(255) NOT NULL,
            "size_bytes" integer NOT NULL,
            "status" character varying NOT NULL DEFAULT 'PENDING',
            "description" character varying(255),
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_document_status" CHECK ("status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
            CONSTRAINT "PK_document_id" PRIMARY KEY ("id")
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tb_documents;`);
    }
}
