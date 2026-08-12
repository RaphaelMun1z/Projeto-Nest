import { ConflictException } from '@nestjs/common';
import { DocumentService } from '../../src/document/document.service';

describe('DocumentService', () => {
    const repository = {
        findOneBy: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    const extraction = { extract: jest.fn() };
    const outbox = { saveDocumentWithEvent: jest.fn() };
    let service: DocumentService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DocumentService(repository, extraction, outbox);
    });

    it('retorna documento por id', async () => {
        const entity = {
            id: 'a',
            fileName: 'a.pdf',
            sizeBytes: 10,
            sections: [],
            disciplina: 'D',
            universidade: 'U',
            ano_curriculo: 2026,
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        repository.findOneBy.mockResolvedValue(entity);

        await expect(service.findById('a')).resolves.toMatchObject({ id: 'a' });
    });

    it('lança 404 para documento inexistente', async () => {
        repository.findOneBy.mockResolvedValue(null);

        await expect(service.findById('missing')).rejects.toMatchObject({
            status: 404,
        });
    });

    it('impede criação com nome duplicado', async () => {
        repository.findOneBy.mockResolvedValue({ id: 'existing' });
        const file = { originalname: 'duplicado.pdf' } as Express.Multer.File;

        await expect(
            service.create(file, {
                disciplina: 'D',
                universidade: 'U',
                ano_curriculo: 2026,
            }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(extraction.extract).not.toHaveBeenCalled();
    });
});
