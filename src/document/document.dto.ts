import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

// ENUM
export enum DocumentStatusEnum {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

// INTERFACE
export interface FindAllParameters {
    fileName?: string;
    status?: DocumentStatusEnum;
}

export interface DocumentSection {
    number: number;
    title: string;
    content: string;
}

export interface ExtractedPdfResDTO {
    fileName: string;
    sizeBytes: number;
    pages: number;
    sections: DocumentSection[];
    previewHtml: string;
}

export interface CreatedDocumentResDTO {
    id: string;
    previewHtml: string;
}

// DTO
export class CreateDocumentReqDTO {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string | null;
}

export class UpdateDocumentReqDTO {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    fileName?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    sizeBytes?: number;

    @IsOptional()
    @IsEnum(DocumentStatusEnum)
    status?: DocumentStatusEnum;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string | null;
}

export class DocumentResDTO {
    @IsUUID()
    id!: string;

    @IsString()
    fileName!: string;

    @IsInt()
    sizeBytes!: number;

    sections!: DocumentSection[];

    @IsEnum(DocumentStatusEnum)
    status!: DocumentStatusEnum;

    @IsOptional()
    @IsString()
    description!: string | null;

    @Type(() => Date)
    createdAt!: Date;

    @Type(() => Date)
    updatedAt!: Date;
}

export type DocumentListResDTO = Omit<DocumentResDTO, 'sections'>;

export class DocumentRouteParameters {
    @IsUUID()
    id!: string;
}
