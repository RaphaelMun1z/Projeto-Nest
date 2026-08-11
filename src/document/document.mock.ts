import { DocumentResDTO, DocumentStatusEnum } from './document.dto';

export const documentsMock: DocumentResDTO[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        originalName: 'contrato-fornecimento.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245760,
        hash: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
        status: DocumentStatusEnum.COMPLETED,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440000/contrato-fornecimento.pdf',
        extractedTextRef:
            'extracted-text/550e8400-e29b-41d4-a716-446655440000.txt',
        createdAt: new Date('2026-08-01T09:00:00.000Z'),
        updatedAt: new Date('2026-08-01T09:05:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        originalName: 'relatorio-financeiro.xlsx',
        mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 524288,
        hash: 'sha256:2222222222222222222222222222222222222222222222222222222222222222',
        status: DocumentStatusEnum.PROCESSING,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440001/relatorio-financeiro.xlsx',
        extractedTextRef: null,
        createdAt: new Date('2026-08-02T10:00:00.000Z'),
        updatedAt: new Date('2026-08-02T10:02:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        originalName: 'manual-de-operacao.docx',
        mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 131072,
        hash: 'sha256:3333333333333333333333333333333333333333333333333333333333333333',
        status: DocumentStatusEnum.PENDING,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440002/manual-de-operacao.docx',
        extractedTextRef: null,
        createdAt: new Date('2026-08-03T11:00:00.000Z'),
        updatedAt: new Date('2026-08-03T11:00:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        originalName: 'nota-fiscal-004.xml',
        mimeType: 'application/xml',
        sizeBytes: 16384,
        hash: 'sha256:4444444444444444444444444444444444444444444444444444444444444444',
        status: DocumentStatusEnum.FAILED,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440003/nota-fiscal-004.xml',
        extractedTextRef: null,
        createdAt: new Date('2026-08-04T12:00:00.000Z'),
        updatedAt: new Date('2026-08-04T12:03:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        originalName: 'politica-de-privacidade.html',
        mimeType: 'text/html',
        sizeBytes: 32768,
        hash: 'sha256:5555555555555555555555555555555555555555555555555555555555555555',
        status: DocumentStatusEnum.COMPLETED,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440004/politica-de-privacidade.html',
        extractedTextRef:
            'extracted-text/550e8400-e29b-41d4-a716-446655440004.txt',
        createdAt: new Date('2026-08-05T13:00:00.000Z'),
        updatedAt: new Date('2026-08-05T13:04:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440005',
        originalName: 'apresentacao-institucional.pptx',
        mimeType:
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        sizeBytes: 1048576,
        hash: 'sha256:6666666666666666666666666666666666666666666666666666666666666666',
        status: DocumentStatusEnum.PROCESSING,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440005/apresentacao-institucional.pptx',
        extractedTextRef: null,
        createdAt: new Date('2026-08-06T14:00:00.000Z'),
        updatedAt: new Date('2026-08-06T14:06:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440006',
        originalName: 'comprovante-endereco.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 409600,
        hash: 'sha256:7777777777777777777777777777777777777777777777777777777777777777',
        status: DocumentStatusEnum.COMPLETED,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440006/comprovante-endereco.jpg',
        extractedTextRef:
            'extracted-text/550e8400-e29b-41d4-a716-446655440006.txt',
        createdAt: new Date('2026-08-07T15:00:00.000Z'),
        updatedAt: new Date('2026-08-07T15:08:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440007',
        originalName: 'recibo-de-pagamento.txt',
        mimeType: 'text/plain',
        sizeBytes: 8192,
        hash: 'sha256:8888888888888888888888888888888888888888888888888888888888888888',
        status: DocumentStatusEnum.PENDING,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440007/recibo-de-pagamento.txt',
        extractedTextRef: null,
        createdAt: new Date('2026-08-08T16:00:00.000Z'),
        updatedAt: new Date('2026-08-08T16:00:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440008',
        originalName: 'laudo-tecnico.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 786432,
        hash: 'sha256:9999999999999999999999999999999999999999999999999999999999999999',
        status: DocumentStatusEnum.COMPLETED,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440008/laudo-tecnico.pdf',
        extractedTextRef:
            'extracted-text/550e8400-e29b-41d4-a716-446655440008.txt',
        createdAt: new Date('2026-08-09T17:00:00.000Z'),
        updatedAt: new Date('2026-08-09T17:10:00.000Z'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440009',
        originalName: 'termo-de-adesao.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 196608,
        hash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        status: DocumentStatusEnum.PROCESSING,
        storageKey:
            'documents/550e8400-e29b-41d4-a716-446655440009/termo-de-adesao.pdf',
        extractedTextRef: null,
        createdAt: new Date('2026-08-10T08:00:00.000Z'),
        updatedAt: new Date('2026-08-10T08:01:00.000Z'),
    },
];
