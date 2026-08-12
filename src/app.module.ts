import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import kafkaConfig from './config/kafka.config';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [kafkaConfig],
        }),
        DocumentModule,
        DbModule,
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
