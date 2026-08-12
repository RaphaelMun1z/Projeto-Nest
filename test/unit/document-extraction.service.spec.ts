import { BadRequestException } from '@nestjs/common';
import { DocumentExtractionService } from '../../src/document/document-extraction.service';

describe('DocumentExtractionService', () => {
    const file = {} as Express.Multer.File;

    it('valida antes de extrair', async () => {
        const validation = { validate: jest.fn() };
        const extracted = {
            fileName: 'documento.pdf',
            sizeBytes: 10,
            pages: 1,
            sections: [],
            previewHtml: '<html />',
        };
        const extractor = { extract: jest.fn().mockResolvedValue(extracted) };
        const service = new DocumentExtractionService(validation, extractor);

        await expect(service.extract(file)).resolves.toEqual(extracted);
        expect(validation.validate).toHaveBeenCalledWith(file);
        expect(extractor.extract).toHaveBeenCalledWith(file);
    });

    it('não extrai quando a validação falha', async () => {
        const validation = {
            validate: jest.fn(() => {
                throw new BadRequestException();
            }),
        };
        const extractor = { extract: jest.fn() };
        const service = new DocumentExtractionService(validation, extractor);

        await expect(service.extract(file)).rejects.toBeInstanceOf(
            BadRequestException,
        );
        expect(extractor.extract).not.toHaveBeenCalled();
    });
});
