import { of } from 'rxjs';
import { DocumentEventProducer } from '../../src/kafka/document-event-producer.service';

describe('DocumentEventProducer', () => {
    it('publica evento com documentId como chave', async () => {
        const client = {
            emit: jest.fn().mockReturnValue(of({})),
        };
        const producer = new DocumentEventProducer(client, 'document.topic');

        await producer.publishDocumentExtracted({
            documentId: 'document-id',
            fileName: 'documento.pdf',
            sizeBytes: 10,
            pages: 1,
            sections: [],
        });

        expect(client.emit).toHaveBeenCalledWith(
            'document.topic',
            expect.objectContaining({
                key: 'document-id',
                value: expect.objectContaining({
                    documentId: 'document-id',
                    eventType: 'document.extracted.v1',
                }) as unknown,
            }),
        );
    });
});
