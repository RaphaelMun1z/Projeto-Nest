import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DocumentReqDTO } from './DocumentReqDTO';

@Injectable()
export class DocumentService {
    private documentsMock: DocumentReqDTO[] = [];

    create(document: DocumentReqDTO): string {
        this.documentsMock.push(document);
        return 'Document created successfully';
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
