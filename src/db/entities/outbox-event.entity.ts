import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type OutboxEventStatus =
    'pending' | 'processing' | 'published' | 'dead-letter';

@Entity({ name: 'tb_outbox_events' })
export class OutboxEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'aggregate_id', type: 'uuid' })
    aggregateId!: string;

    @Column({ name: 'event_id', type: 'uuid', unique: true })
    eventId!: string;

    @Column({ name: 'event_type', type: 'varchar', length: 100 })
    eventType!: string;

    @Column({ name: 'payload', type: 'jsonb' })
    payload!: Record<string, unknown>;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: OutboxEventStatus;

    @Column({ type: 'integer', default: 0 })
    attempts!: number;

    @Column({
        name: 'available_at',
        type: 'timestamptz',
        default: () => 'now()',
    })
    availableAt!: Date;

    @Column({ name: 'last_error', type: 'text', nullable: true })
    lastError!: string | null;

    @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
    lockedAt!: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
