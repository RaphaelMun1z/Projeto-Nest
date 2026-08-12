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

    validate(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
        this.validation.validate(file);
    }

    async extract(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        this.validate(file);
        return this.extractor.extract(file);
    }
}
