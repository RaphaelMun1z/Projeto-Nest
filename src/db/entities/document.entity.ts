import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DocumentStatusEnum } from '../../document/document.dto';

@Entity({ name: 'tb_documents' })
export class DocumentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'file_name', type: 'varchar', length: 255 })
    fileName!: string;

    @Column({ name: 'size_bytes', type: 'integer' })
    sizeBytes!: number;

    @Column({
        name: 'status',
        type: 'varchar',
        default: DocumentStatusEnum.PENDING,
    })
    status!: DocumentStatusEnum;

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
