import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'username', type: 'varchar', length: 100, unique: true })
    username!: string;

    @Column({ name: 'password', type: 'varchar', length: 72 })
    password!: string;
}
