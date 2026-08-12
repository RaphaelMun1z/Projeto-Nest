import { Injectable } from '@nestjs/common';
import { ExtractedPdfResDTO } from './document.dto';
import { PdfTextExtractor } from './pdf-extraction.service';
import { PdfValidationService } from './pdf-validation.service';

@Injectable()
export class DocumentExtractionService {
    constructor(
        private readonly validation: PdfValidationService,
        private readonly extractor: PdfTextExtractor,
    ) {}

    async extract(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        this.validation.validate(file);
        return this.extractor.extract(file);
    }
}
