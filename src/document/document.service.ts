import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import {
    CreateDocumentReqDTO,
    CreatedDocumentResDTO,
    DocumentListResDTO,
    DocumentResDTO,
    DocumentStatusEnum,
    ExtractedPdfResDTO,
    FindAllParameters,
    UpdateDocumentReqDTO,
} from './document.dto';
import { PdfExtractionService } from './pdf-extraction.service';
import { DocumentEntity } from '../db/entities/document.entity';

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly pdfExtractionService: PdfExtractionService,
    ) {}

    async extractPdf(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        return await this.pdfExtractionService.extract(file);
    }

    async create(
        file: Express.Multer.File | undefined,
        document: CreateDocumentReqDTO,
    ): Promise<CreatedDocumentResDTO> {
        if (file) {
            const existingDocument = await this.documentRepository.findOneBy({
                fileName: file.originalname,
            });

            if (existingDocument) {
                throw new ConflictException(
                    `Já existe um documento com o nome de arquivo "${file.originalname}".`,
                );
            }
        }

        const extractedDocument = await this.pdfExtractionService.extract(file);
        const savedDocument = await this.documentRepository.save({
            fileName: extractedDocument.fileName,
            sizeBytes: extractedDocument.sizeBytes,
            sections: extractedDocument.sections,
            status: DocumentStatusEnum.COMPLETED,
            description: document.description ?? null,
        });

        return {
            id: savedDocument.id,
            previewHtml: extractedDocument.previewHtml,
        };
    }

    async findAll(params: FindAllParameters): Promise<DocumentListResDTO[]> {
        const searchParams: FindOptionsWhere<DocumentEntity> = {};

        if (params.fileName) {
            searchParams.fileName = Like(`%${params.fileName}%`);
        }

        if (params.status) {
            searchParams.status = params.status;
        }

        const documentsFound = await this.documentRepository.find({
            where: searchParams,
            order: { createdAt: 'DESC' },
        });

        return documentsFound.map((document) => ({
            id: document.id,
            fileName: document.fileName,
            sizeBytes: document.sizeBytes,
            status: document.status,
            description: document.description,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        }));
    }

    async findById(id: string): Promise<DocumentResDTO> {
        const document = await this.documentRepository.findOneBy({ id });

        if (document) {
            return document;
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    async update(
        id: string,
        updatedDocument: UpdateDocumentReqDTO,
    ): Promise<string> {
        const result = await this.documentRepository.update(
            id,
            updatedDocument,
        );

        if (result.affected) {
            return 'Documento atualizado com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    async delete(id: string): Promise<string> {
        const result = await this.documentRepository.delete(id);

        if (result.affected) {
            return 'Documento excluído com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }
}
