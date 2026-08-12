import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfValidationService {
    private readonly maxPdfSizeBytes: number;

    constructor(configService: ConfigService) {
        const configuredMaxPdfSize = Number(
            configService.get<string>('MAX_PDF_SIZE_BYTES'),
        );

        this.maxPdfSizeBytes =
            Number.isFinite(configuredMaxPdfSize) && configuredMaxPdfSize > 0
                ? configuredMaxPdfSize
                : 10 * 1024 * 1024;
    }

    validate(
        file: Express.Multer.File | undefined,
    ): asserts file is Express.Multer.File {
        if (!file) {
            throw new BadRequestException(
                'Envie um arquivo PDF no campo "file".',
            );
        }

        if (file.size > this.maxPdfSizeBytes) {
            const maxPdfSizeInMb = this.maxPdfSizeBytes / 1024 / 1024;

            throw new BadRequestException(
                `O PDF nÃ£o pode ultrapassar ${maxPdfSizeInMb} MB.`,
            );
        }

        const pdfSignature = file.buffer.subarray(0, 5).toString('ascii');

        if (file.mimetype !== 'application/pdf' || pdfSignature !== '%PDF-') {
            throw new BadRequestException(
                'O arquivo enviado nÃ£o Ã© um PDF vÃ¡lido.',
            );
        }
    }
}
