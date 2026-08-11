import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
} from '@nestjs/common';
import {
    CreateDocumentReqDTO,
    DocumentResDTO,
    DocumentStatusEnum,
    ExtractedPdfResDTO,
    FindAllParameters,
    UpdateDocumentReqDTO,
} from './document.dto';
import { ConfigService } from '@nestjs/config';
import { documentsMock } from './document.mock';
import { createHash } from 'node:crypto';
import { v4 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const loadLiteParse = new Function(
    'return import("@llamaindex/liteparse")',
) as () => Promise<typeof import('@llamaindex/liteparse')>;

@Injectable()
export class DocumentService {
    private readonly logger = new Logger(DocumentService.name);

    private readonly maxPdfSizeBytes: number;

    private documentsMock: DocumentResDTO[] = [...documentsMock];

    constructor(private readonly configService: ConfigService) {
        const configuredMaxPdfSize = Number(
            this.configService.get<string>('MAX_PDF_SIZE_BYTES'),
        );

        this.maxPdfSizeBytes =
            Number.isFinite(configuredMaxPdfSize) && configuredMaxPdfSize > 0
                ? configuredMaxPdfSize
                : 10 * 1024 * 1024;
    }

    async extractPdf(
        file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        if (!file) {
            throw new BadRequestException(
                'Envie um arquivo PDF no campo "file".',
            );
        }

        if (file.size > this.maxPdfSizeBytes) {
            const maxPdfSizeInMb = this.maxPdfSizeBytes / 1024 / 1024;

            throw new BadRequestException(
                `O PDF não pode ultrapassar ${maxPdfSizeInMb} MB.`,
            );
        }

        const pdfSignature = file.buffer.subarray(0, 5).toString('ascii');

        if (file.mimetype !== 'application/pdf' || pdfSignature !== '%PDF-') {
            throw new BadRequestException(
                'O arquivo enviado não é um PDF válido.',
            );
        }

        try {
            const { LiteParse } = await loadLiteParse();

            const parser = new LiteParse({
                ocrEnabled: false,
                outputFormat: 'text',
            });

            const result = await parser.parse(file.buffer);

            return {
                originalName: file.originalname,
                mimeType: 'application/pdf',
                sizeBytes: file.size,
                hash: createHash('sha256').update(file.buffer).digest('hex'),
                pages: result.pages.length,
                content: this.normalizeExtractedText(result.text),
            };
        } catch (error) {
            this.logger.error(
                'Erro durante a extração do PDF',
                error instanceof Error ? error.stack : String(error),
            );

            throw new BadRequestException(
                'Não foi possível ler ou extrair o conteúdo desse PDF.',
            );
        }
    }

    private normalizeExtractedText(text: string): string {
        return text
            .normalize('NFC')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .map((line) => line.trim())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    create(document: CreateDocumentReqDTO): string {
        const now = new Date();

        this.documentsMock.push({
            id: uuid(),
            status: DocumentStatusEnum.PENDING,
            originalName: document.originalName,
            mimeType: document.mimeType,
            sizeBytes: document.sizeBytes,
            hash: document.hash,
            storageKey: document.storageKey,
            extractedTextRef: document.extractedTextRef ?? null,
            createdAt: now,
            updatedAt: now,
        });

        return 'Documento criado com sucesso';
    }

    findAll(params: FindAllParameters): DocumentResDTO[] {
        return this.documentsMock.filter((doc) => {
            const matchesName = params.originalName
                ? doc.originalName.includes(params.originalName)
                : true;

            const matchesStatus = params.status
                ? doc.status === params.status
                : true;

            return matchesName && matchesStatus;
        });
    }

    findById(id: string): DocumentResDTO | undefined {
        const itemFound = this.documentsMock.filter((doc) => doc.id === id);

        if (itemFound.length) {
            return itemFound[0];
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    update(id: string, updatedDocument: UpdateDocumentReqDTO): string {
        const index = this.documentsMock.findIndex((doc) => doc.id === id);

        if (index !== -1) {
            this.documentsMock[index] = {
                ...this.documentsMock[index],
                ...updatedDocument,
                updatedAt: new Date(),
            };
            return 'Documento atualizado com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }

    delete(id: string): string {
        const index = this.documentsMock.findIndex((doc) => doc.id === id);

        if (index !== -1) {
            this.documentsMock.splice(index, 1);
            return 'Documento excluído com sucesso';
        }

        throw new HttpException(
            'Documento com ID ' + id + ' não encontrado',
            HttpStatus.NOT_FOUND,
        );
    }
}
