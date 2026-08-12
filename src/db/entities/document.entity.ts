import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DocumentSection } from '../../document/document.dto';

@Entity({ name: 'tb_documents' })
export class DocumentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'file_name',
        type: 'varchar',
        length: 255,
        unique: true,
    })
    fileName!: string;

    @Column({ name: 'size_bytes', type: 'integer' })
    sizeBytes!: number;

    @Column({ name: 'sections', type: 'jsonb', default: () => "'[]'::jsonb" })
    sections!: DocumentSection[];

    @Column({ name: 'disciplina', type: 'varchar', length: 255 })
    disciplina!: string;

    @Column({ name: 'universidade', type: 'varchar', length: 255 })
    universidade!: string;

    @Column({ name: 'ano_curriculo', type: 'integer' })
    ano_curriculo!: number;

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description!: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
