import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    CreateDocumentReqDTO,
    DocumentResDTO,
    DocumentStatusEnum,
    ExtractedPdfResDTO,
    FindAllParameters,
    UpdateDocumentReqDTO,
} from './document.dto';
import { documentsMock } from './document.mock';
import { v4 as uuid } from 'uuid';
import { PdfExtractionService } from './pdf-extraction.service';

@Injectable()
export class DocumentService {
    private documentsMock: DocumentResDTO[] = [...documentsMock];

    constructor(private readonly pdfExtractionService: PdfExtractionService) {}

    extractPdf(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        return this.pdfExtractionService.extract(file);
    }

    create(document: CreateDocumentReqDTO): string {
        const now = new Date();
        this.documentsMock.push({
            id: uuid(),
            status: DocumentStatusEnum.PENDING,
            originalName: document.originalName,
            mimeType: document.mimeType,
            sizeBytes: document.sizeBytes,
            hash: document.hash,
            storageKey: document.storageKey,
            extractedTextRef: document.extractedTextRef ?? null,
            createdAt: now,
            updatedAt: now,
        });
        return 'Documento criado com sucesso';
    }

    findAll(params: FindAllParameters): DocumentResDTO[] {
        return this.documentsMock.filter((doc) => {
            const matchesName = params.originalName
                ? doc.originalName.includes(params.originalName)
                : true;
            const matchesStatus = params.status
                ? doc.status === params.status
                : true;
            return matchesName && matchesStatus;
        });
    }

    findById(id: string): DocumentResDTO | undefined {
        const itemFound = this.documentsMock.filter((doc) => doc.id === id);
        if (itemFound.length) {
            return itemFound[0];
        }
        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    update(id: string, updatedDocument: UpdateDocumentReqDTO): string {
        const index = this.documentsMock.findIndex((doc) => doc.id === id);
        if (index !== -1) {
            this.documentsMock[index] = {
                ...this.documentsMock[index],
                ...updatedDocument,
                updatedAt: new Date(),
            };
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
