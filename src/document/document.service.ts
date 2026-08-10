import { Injectable } from '@nestjs/common';
import { DocumentReqDTO } from './DocumentReqDTO';

@Injectable()
export class DocumentService {
    private documentsMock: DocumentReqDTO[] = [];

    create(document: DocumentReqDTO): string {
        this.documentsMock.push(document);
        return 'Document created successfully';
    }
}
