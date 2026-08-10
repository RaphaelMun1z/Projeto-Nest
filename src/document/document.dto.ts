// ENUM
export enum DocumentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

// INTERFACE
export interface FindAllParameters {
    originalName: string;
    status: DocumentStatus;
}

// DTO
export class DocumentReqDTO {
    id!: string;
    originalName!: string;
    mimeType!: string;
    sizeBytes!: number;
    hash!: string;
    status!: DocumentStatus;
    storageKey!: string;
    extractedTextRef!: string | null;
    createdAt!: Date;
    updatedAt!: Date;
}
