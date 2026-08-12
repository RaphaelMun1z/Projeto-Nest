import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class FindAllParameters {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fileName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    disciplina?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    universidade?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    ano_curriculo?: number;
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
    status: DocumentStatus;
}

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export class CreateDocumentReqDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    disciplina!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(255)
    universidade!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    ano_curriculo!: number;

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
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    sizeBytes?: number;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    disciplina?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    universidade?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    ano_curriculo?: number;

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

    status!: DocumentStatus;

    processingError!: string | null;

    @IsString()
    disciplina!: string;

    @IsString()
    universidade!: string;

    @IsInt()
    ano_curriculo!: number;

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
