import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { DocumentController } from '../../src/document/document.controller';
import { DocumentService } from '../../src/document/document.service';

describe('Documents E2E', () => {
    let app: INestApplication;
    const documentService = {
        create: jest.fn().mockResolvedValue({
            id: 'document-id',
            previewHtml: '<html />',
        }),
        extractPdf: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [DocumentController],
            providers: [
                { provide: DocumentService, useValue: documentService },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('recebe upload e encaminha os dados ao serviço', async () => {
        await request(app.getHttpServer() as unknown as Server)
            .post('/documents')
            .field('disciplina', 'Engenharia de Software')
            .field('universidade', 'Universidade de Teste')
            .field('ano_curriculo', '2026')
            .attach('file', Buffer.from('%PDF-1.7'), 'documento.pdf')
            .expect(201)
            .expect({ id: 'document-id', previewHtml: '<html />' });

        expect(documentService.create).toHaveBeenCalledWith(
            expect.objectContaining({ originalname: 'documento.pdf' }),
            expect.objectContaining({
                disciplina: 'Engenharia de Software',
                universidade: 'Universidade de Teste',
                ano_curriculo: 2026,
            }),
        );
    });
});
