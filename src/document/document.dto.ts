import { Type } from 'class-transformer';
import {
    IsEnum,
    IsHash,
    IsInt,
    IsMimeType,
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
    originalName?: string;
    status?: DocumentStatusEnum;
}

// DTO
export interface ExtractedPdfResDTO {
    originalName: string;
    mimeType: 'application/pdf';
    sizeBytes: number;
    hash: string;
    pages: number;
    content: string;
}

export class CreateDocumentReqDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    originalName!: string;

    @IsMimeType()
    mimeType!: string;

    @IsInt()
    @IsPositive()
    sizeBytes!: number;

    @IsHash('sha256')
    hash!: string;

    @IsString()
    @MaxLength(255)
    storageKey!: string;

    @IsOptional()
    @IsString()
    extractedTextRef?: string | null;
}

export class UpdateDocumentReqDTO {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    originalName?: string;

    @IsOptional()
    @IsMimeType()
    mimeType?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    sizeBytes?: number;

    @IsOptional()
    @IsHash('sha256')
    hash?: string;

    @IsOptional()
    @IsEnum(DocumentStatusEnum)
    status?: DocumentStatusEnum;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    storageKey?: string;

    @IsOptional()
    @IsString()
    extractedTextRef?: string | null;
}

export class DocumentResDTO {
    @IsUUID()
    id!: string;

    @IsString()
    originalName!: string;

    @IsMimeType()
    mimeType!: string;

    @IsInt()
    sizeBytes!: number;

    @IsHash('sha256')
    hash!: string;

    @IsEnum(DocumentStatusEnum)
    status!: DocumentStatusEnum;

    @IsString()
    storageKey!: string;

    @IsOptional()
    @IsString()
    extractedTextRef!: string | null;

    @Type(() => Date)
    createdAt!: Date;

    @Type(() => Date)
    updatedAt!: Date;
}
