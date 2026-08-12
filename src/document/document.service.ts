import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
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
import { DocumentExtractionService } from './document-extraction.service';
import { DocumentEntity } from '../db/entities/document.entity';
import { DocumentMapper } from './document.mapper';
import { DocumentOutboxService } from './document-outbox.service';
import { getRuntimeInstanceName } from '../config/runtime-instance';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DocumentService {
    private readonly logger = new Logger(DocumentService.name);

    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly pdfExtractionService: DocumentExtractionService,
        private readonly documentOutboxService: DocumentOutboxService,
    ) {}

    async extractPdf(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        const extracted = await this.pdfExtractionService.extract(file);
        this.logger.log(
            `PDF extraído: arquivo=${extracted.fileName}, páginas=${extracted.pages}, seções=${extracted.sections.length}`,
        );
        return extracted;
    }

    async create(
        file: Express.Multer.File | undefined,
        document: CreateDocumentReqDTO,
    ): Promise<CreatedDocumentResDTO> {
        this.pdfExtractionService.validate(file);
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

        const documentEntity = DocumentMapper.toEntity(
            document,
            {
                fileName: file!.originalname,
                sizeBytes: file!.size,
                sections: [],
            },
        );
        documentEntity.pdfData = file!.buffer;
        const savedDocument = await this.documentOutboxService.saveDocumentForExtraction(
            documentEntity,
            randomUUID(),
        );

        this.logger.log(
            `Documento persistido: id=${savedDocument.id}, arquivo=${savedDocument.fileName}`,
        );

        this.logger.log(
            `Criação concluída: id=${savedDocument.id}, instancia=${getRuntimeInstanceName()}`,
        );

        return DocumentMapper.toCreatedResponse(savedDocument);
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

        this.logger.debug(
            `Consulta de documentos concluída: resultados=${documentsFound.length}`,
        );

        return documentsFound.map((document) =>
            DocumentMapper.toListResponseDTO(document),
        );
    }

    async findById(id: string): Promise<DocumentResDTO> {
        const document = await this.documentRepository.findOneBy({ id });

        if (document) {
            this.logger.debug(`Documento encontrado: id=${id}`);
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
            this.logger.log(`Documento atualizado: id=${id}`);
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
            this.logger.log(`Documento excluído: id=${id}`);
            return 'Documento excluído com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }
}
