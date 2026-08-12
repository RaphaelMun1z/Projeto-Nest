import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import kafkaConfig from './config/kafka.config';
import { DbModule } from './db/db.module';
import { DocumentEntity } from './db/entities/document.entity';
import { OutboxEventEntity } from './db/entities/outbox-event.entity';
import { PdfTextExtractor } from './document/pdf-extraction.service';
import { DocumentExtractionWorker } from './document/document-extraction.worker';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [kafkaConfig] }),
        DbModule,
        TypeOrmModule.forFeature([DocumentEntity, OutboxEventEntity]),
    ],
    providers: [PdfTextExtractor, DocumentExtractionWorker],
})
export class WorkerModule {}
