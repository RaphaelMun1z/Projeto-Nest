import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PdfValidationService } from '../../src/document/pdf-validation.service';

function makeFile(overrides: Partial<Express.Multer.File> = {}) {
    return {
        fieldname: 'file',
        originalname: 'documento.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 5,
        destination: '',
        filename: 'documento.pdf',
        path: '',
        buffer: Buffer.from('%PDF-1.7'),
        stream: undefined as never,
        ...overrides,
    };
}

describe('PdfValidationService', () => {
    it('aceita um PDF válido', () => {
        const config = new ConfigService({ MAX_PDF_SIZE_BYTES: '100' });
        const service = new PdfValidationService(config);

        expect(() => service.validate(makeFile())).not.toThrow();
    });

    it('rejeita arquivo ausente', () => {
        const service = new PdfValidationService(new ConfigService());

        expect(() => service.validate(undefined)).toThrow(BadRequestException);
    });

    it('rejeita arquivo acima do limite', () => {
        const service = new PdfValidationService(
            new ConfigService({ MAX_PDF_SIZE_BYTES: '4' }),
        );

        expect(() => service.validate(makeFile({ size: 5 }))).toThrow(
            BadRequestException,
        );
    });

    it('rejeita MIME type ou assinatura inválida', () => {
        const service = new PdfValidationService(new ConfigService());

        expect(() =>
            service.validate(
                makeFile({
                    mimetype: 'text/plain',
                    buffer: Buffer.from('not-a-pdf'),
                }),
            ),
        ).toThrow(BadRequestException);
    });
});
