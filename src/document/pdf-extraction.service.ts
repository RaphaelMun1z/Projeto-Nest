import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentSection, ExtractedPdfResDTO } from './document.dto';

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const loadLiteParse = new Function(
    'return import("@llamaindex/liteparse")',
) as () => Promise<typeof import('@llamaindex/liteparse')>;

@Injectable()
export class PdfExtractionService {
    private readonly logger = new Logger(PdfExtractionService.name);
    private readonly maxPdfSizeBytes: number;

    constructor(private readonly configService: ConfigService) {
        const configuredMaxPdfSize = Number(
            this.configService.get<string>('MAX_PDF_SIZE_BYTES'),
        );
        this.maxPdfSizeBytes =
            Number.isFinite(configuredMaxPdfSize) && configuredMaxPdfSize > 0
                ? configuredMaxPdfSize
                : 10 * 1024 * 1024;
    }

    async extract(
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
            const normalizedText = this.normalizeExtractedText(result.text);
            const sections = this.extractSections(normalizedText);
            this.validateSections(sections);
            return {
                fileName: file.originalname,
                sizeBytes: file.size,
                pages: result.pages.length,
                sections,
                previewHtml: this.buildPreviewHtml(sections),
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
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

    private extractSections(text: string): DocumentSection[] {
        const sectionPattern =
            /(?:^|\n)([1-9])\.\s+(IDENTIFICAÇÃO|EMENTA|JUSTIFICATIVA|OBJETIVO|PROGRAMA|METODOLOGIA|AVALIAÇÃO|BIBLIOGRAFIA|APROVAÇÃO)\s*\n/g;
        const matches = [...text.matchAll(sectionPattern)];
        return matches.map((match, index) => {
            const contentStart = match.index + match[0].length;
            const contentEnd =
                index + 1 < matches.length
                    ? matches[index + 1].index
                    : text.length;
            return {
                number: Number(match[1]),
                title: match[2],
                content: text.slice(contentStart, contentEnd).trim(),
            };
        });
    }

    private validateSections(sections: DocumentSection[]): void {
        const expectedSections = [
            'IDENTIFICAÇÃO',
            'EMENTA',
            'JUSTIFICATIVA',
            'OBJETIVO',
            'PROGRAMA',
            'METODOLOGIA',
            'AVALIAÇÃO',
            'BIBLIOGRAFIA',
            'APROVAÇÃO',
        ];
        const foundSections = sections.map((section) => section.title);
        const missingSections = expectedSections.filter(
            (section) => !foundSections.includes(section),
        );
        if (missingSections.length > 0) {
            throw new BadRequestException(
                `Seções não encontradas: ${missingSections.join(', ')}`,
            );
        }
    }

    private buildPreviewHtml(sections: DocumentSection[]): string {
        const sectionsHtml = sections
            .map(
                (section) => `
                    <section>
                        <h2>${section.number}. ${this.escapeHtml(section.title)}</h2>
                        <p>${this.escapeHtml(section.content).replace(/\n/g, '<br />')}</p>
                    </section>`,
            )
            .join('\n');

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview do documento</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem auto; max-width: 900px; padding: 0 1rem; color: #222; }
            section { margin-bottom: 1.5rem; }
            h1 { margin-bottom: 2rem; }
            h2 { font-size: 1.2rem; margin-bottom: 0.5rem; }
            p { white-space: normal; }
        </style>
</head>
<body>
    <h1>Preview do documento</h1>
${sectionsHtml}
</body>
</html>`.replace(/\r?\n/g, '');
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
