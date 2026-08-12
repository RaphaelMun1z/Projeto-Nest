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
    ExtractedPdfResDTO,
    FindAllParameters,
    UpdateDocumentReqDTO,
} from './document.dto';
import { PdfExtractionService } from './pdf-extraction.service';
import { DocumentEntity } from '../db/entities/document.entity';
import { DocumentMapper } from './document.mapper';

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
        const documentEntity = DocumentMapper.toEntity(
            document,
            extractedDocument,
        );
        const savedDocument =
            await this.documentRepository.save(documentEntity);

        return DocumentMapper.toCreatedResponse(
            savedDocument,
            extractedDocument.previewHtml,
        );
    }

    async findAll(params: FindAllParameters): Promise<DocumentListResDTO[]> {
        const searchParams: FindOptionsWhere<DocumentEntity> = {};

        if (params.fileName) {
            searchParams.fileName = Like(`%${params.fileName}%`);
        }

        if (params.disciplina) {
            searchParams.disciplina = Like(`%${params.disciplina}%`);
        }

        if (params.universidade) {
            searchParams.universidade = Like(`%${params.universidade}%`);
        }

        if (params.ano_curriculo) {
            searchParams.ano_curriculo = params.ano_curriculo;
        }

        const documentsFound = await this.documentRepository.find({
            where: searchParams,
            order: { createdAt: 'DESC' },
        });

        return documentsFound.map((document) =>
            DocumentMapper.toListResponseDTO(document),
        );
    }

    async findById(id: string): Promise<DocumentResDTO> {
        const document = await this.documentRepository.findOneBy({ id });

        if (document) {
            return DocumentMapper.toResponseDTO(document);
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
        const entity = DocumentMapper.toUpdateEntity(updatedDocument);
        const result = await this.documentRepository.update(id, entity);

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
