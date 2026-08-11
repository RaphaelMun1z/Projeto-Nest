import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PdfExtractionService } from './pdf-extraction.service';

@Module({
    controllers: [DocumentController],
    providers: [DocumentService, PdfExtractionService],
})
export class DocumentModule {}
