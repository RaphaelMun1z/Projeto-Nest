import {
    CreateDocumentReqDTO,
    CreatedDocumentResDTO,
    DocumentListResDTO,
    DocumentResDTO,
    DocumentSection,
    UpdateDocumentReqDTO,
} from './document.dto';
import { DocumentEntity } from '../db/entities/document.entity';

export class DocumentMapper {
    static toEntity(
        document: CreateDocumentReqDTO,
        extracted: {
            fileName: string;
            sizeBytes: number;
            sections: DocumentSection[];
        },
    ): DocumentEntity {
        const entity = new DocumentEntity();

        entity.fileName = extracted.fileName;
        entity.sizeBytes = extracted.sizeBytes;
        entity.sections = extracted.sections;
        entity.disciplina = document.disciplina;
        entity.universidade = document.universidade;
        entity.ano_curriculo = document.ano_curriculo;
        entity.description = document.description ?? null;

        return entity;
    }

    static toUpdateEntity(
        document: UpdateDocumentReqDTO,
    ): Partial<DocumentEntity> {
        const entity: Partial<DocumentEntity> = {};

        if (document.fileName !== undefined)
            entity.fileName = document.fileName;
        if (document.sizeBytes !== undefined)
            entity.sizeBytes = document.sizeBytes;
        if (document.disciplina !== undefined)
            entity.disciplina = document.disciplina;
        if (document.universidade !== undefined)
            entity.universidade = document.universidade;
        if (document.ano_curriculo !== undefined) {
            entity.ano_curriculo = document.ano_curriculo;
        }
        if (document.description !== undefined) {
            entity.description = document.description;
        }

        return entity;
    }

    static toCreatedResponse(
        entity: DocumentEntity,
        previewHtml: string,
    ): CreatedDocumentResDTO {
        return {
            id: entity.id,
            previewHtml,
        };
    }

    static toResponseDTO(entity: DocumentEntity): DocumentResDTO {
        return {
            id: entity.id,
            fileName: entity.fileName,
            sizeBytes: entity.sizeBytes,
            sections: entity.sections,
            disciplina: entity.disciplina,
            universidade: entity.universidade,
            ano_curriculo: entity.ano_curriculo,
            description: entity.description,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static toListResponseDTO(entity: DocumentEntity): DocumentListResDTO {
        const response = this.toResponseDTO(entity);

        return {
            id: response.id,
            fileName: response.fileName,
            sizeBytes: response.sizeBytes,
            disciplina: response.disciplina,
            universidade: response.universidade,
            ano_curriculo: response.ano_curriculo,
            description: response.description,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
        };
    }
}
