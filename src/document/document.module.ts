import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentExtractionService } from './document-extraction.service';
import { PdfTextExtractor } from './pdf-extraction.service';
import { PdfValidationService } from './pdf-validation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../db/entities/document.entity';
import { OutboxEventEntity } from '../db/entities/outbox-event.entity';
import { DocumentOutboxService } from './document-outbox.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DocumentEntity, OutboxEventEntity]),
        KafkaModule,
    ],
    controllers: [DocumentController],
    providers: [
        DocumentService,
        DocumentExtractionService,
        PdfTextExtractor,
        PdfValidationService,
        DocumentOutboxService,
    ],
})
export class DocumentModule {}
