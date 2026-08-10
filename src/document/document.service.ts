import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DocumentReqDTO } from './DocumentReqDTO';

@Injectable()
export class DocumentService {
    private documentsMock: DocumentReqDTO[] = [
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Documento 1' },
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Documento 2' },
        { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Documento 3' },
        { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Documento 4' },
        { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Documento 5' },
        { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Documento 6' },
        { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Documento 7' },
        { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Documento 8' },
        { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Documento 9' },
        { id: '550e8400-e29b-41d4-a716-446655440009', name: 'Documento 10' },
    ];

    create(document: DocumentReqDTO): string {
        this.documentsMock.push(document);
        return 'Documento criado com sucesso';
    }

    findAll(): DocumentReqDTO[] {
        return this.documentsMock;
    }

    findById(id: string): DocumentReqDTO | undefined {
        const itemFound = this.documentsMock.filter((doc) => doc.id === id);

        if (itemFound.length) {
            return itemFound[0];
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    update(id: string, updatedDocument: DocumentReqDTO): string {
        const index = this.documentsMock.findIndex((doc) => doc.id === id);

        if (index !== -1) {
            this.documentsMock[index] = updatedDocument;
            return 'Documento atualizado com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    delete(id: string): string {
        const index = this.documentsMock.findIndex((doc) => doc.id === id);

        if (index !== -1) {
            this.documentsMock.splice(index, 1);
            return 'Documento excluído com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }
}
