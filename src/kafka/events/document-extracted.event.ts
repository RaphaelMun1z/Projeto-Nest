export const DOCUMENT_EXTRACTED_EVENT = 'document.extracted.v1';
export const DOCUMENT_EXTRACTION_REQUESTED_EVENT = 'document.extraction.requested.v1';

export interface DocumentExtractionRequestedEvent {
    eventId: string;
    eventType: typeof DOCUMENT_EXTRACTION_REQUESTED_EVENT;
    occurredAt: string;
    documentId: string;
}

export interface DocumentExtractedEvent {
    eventId: string;
    eventType: typeof DOCUMENT_EXTRACTED_EVENT;
    occurredAt: string;
    documentId: string;
    fileName: string;
    sizeBytes: number;
    pages: number;
    sections: Array<{
        number: number;
        title: string;
        content: string;
    }>;
}
