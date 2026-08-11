import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTable1786480270336 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE tb_users (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "username" character varying(100) NOT NULL,
            "password" character varying(72) NOT NULL,
            CONSTRAINT "UQ_tb_users_username" UNIQUE ("username"),
            CONSTRAINT "PK_tb_users_id" PRIMARY KEY ("id")
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tb_users;`);
    }
}
