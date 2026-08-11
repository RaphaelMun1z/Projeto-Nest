import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PdfExtractionService } from './pdf-extraction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../db/entities/document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentEntity])],
    controllers: [DocumentController],
    providers: [DocumentService, PdfExtractionService],
})
export class DocumentModule {}
