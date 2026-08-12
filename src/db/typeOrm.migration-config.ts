import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';
import { OutboxEventEntity } from './entities/outbox-event.entity';

config();

const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [DocumentEntity, OutboxEventEntity],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
};

export default new DataSource(dataSourceOptions);
