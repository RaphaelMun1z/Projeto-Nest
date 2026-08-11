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

export enum DocumentStatusEnum {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

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

export class CreateDocumentReqDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    fileName!: string;

    @IsInt()
    @IsPositive()
    sizeBytes!: number;

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
