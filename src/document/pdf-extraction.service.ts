import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentSection, ExtractedPdfResDTO } from './document.dto';

// O LiteParse é ESM-only. O import dinâmico evita conflito
// com projetos NestJS compilados como CommonJS.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const loadLiteParse = new Function(
    'return import("@llamaindex/liteparse")',
) as () => Promise<typeof import('@llamaindex/liteparse')>;

@Injectable()
export class PdfExtractionService {
    private readonly logger = new Logger(PdfExtractionService.name);

    private readonly maxPdfSizeBytes: number;

    private readonly expectedSections = [
        'IDENTIFICAÇÃO',
        'OBJETIVOS',
        'EMENTA',
        'PROGRAMA',
        'BIBLIOGRAFIA BÁSICA',
        'BIBLIOGRAFIA COMPLEMENTAR',
        'APROVAÇÃO',
    ];

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
        this.validatePdf(file);

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

    // -------------------------------------------------------------------------
    // Validação do arquivo
    // -------------------------------------------------------------------------

    private validatePdf(
        file: Express.Multer.File | undefined,
    ): asserts file is Express.Multer.File {
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
    }

    // -------------------------------------------------------------------------
    // Normalização
    // -------------------------------------------------------------------------

    private normalizeExtractedText(text: string): string {
        return (
            text
                .normalize('NFC')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .split('\n')
                .map((line) => line.trim())

                // Remove cabeçalhos repetidos gerados pelo SEI.
                .filter((line) => !this.isSeiHeader(line))

                // Remove URL de impressão presente no topo/rodapé das páginas.
                .filter((line) => !this.isSeiPrintUrl(line))

                // Remove indicadores de página como "1/4", "2/4" etc.
                .filter((line) => !this.isPageIndicator(line))

                .join('\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim()
        );
    }

    private isSeiHeader(line: string): boolean {
        return /^\d{2}\/\d{2}\/\d{4},\s+\d{2}:\d{2}\s+SEI\/UFU\s+-/.test(line);
    }

    private isSeiPrintUrl(line: string): boolean {
        return line.startsWith(
            'https://www.sei.ufu.br/sei/controlador.php?acao=documento_imprimir_web',
        );
    }

    private isPageIndicator(line: string): boolean {
        return /^\d+\/\d+$/.test(line);
    }

    // -------------------------------------------------------------------------
    // Separação das seções
    // -------------------------------------------------------------------------

    private extractSections(text: string): DocumentSection[] {
        const sectionPattern =
            /(?:^|\n)([1-6])\.\s+(OBJETIVOS|EMENTA|PROGRAMA|BIBLIOGRAFIA BÁSICA|BIBLIOGRAFIA COMPLEMENTAR|APROVAÇÃO)\s*\n/g;

        const matches = [...text.matchAll(sectionPattern)];

        if (matches.length === 0) {
            return [];
        }

        const sections: DocumentSection[] = [];

        this.addIdentificationSection(text, matches, sections);

        matches.forEach((match, index) => {
            const contentStart = match.index + match[0].length;

            const contentEnd =
                index + 1 < matches.length
                    ? matches[index + 1].index
                    : text.length;

            sections.push({
                number: Number(match[1]),
                title: match[2],
                content: text.slice(contentStart, contentEnd).trim(),
            });
        });

        return sections;
    }

    /**
     * O novo template não possui "0. IDENTIFICAÇÃO".
     * Tudo antes de "1. OBJETIVOS" corresponde ao cabeçalho da ficha.
     */
    private addIdentificationSection(
        text: string,
        matches: RegExpMatchArray[],
        sections: DocumentSection[],
    ): void {
        const firstSectionIndex = matches[0].index;

        const content = text.slice(0, firstSectionIndex).trim();

        if (!content) {
            return;
        }

        sections.push({
            number: 0,
            title: 'IDENTIFICAÇÃO',
            content,
        });
    }

    private validateSections(sections: DocumentSection[]): void {
        const foundSections = sections.map((section) => section.title);

        const missingSections = this.expectedSections.filter(
            (section) => !foundSections.includes(section),
        );

        if (missingSections.length > 0) {
            throw new BadRequestException(
                `Seções não encontradas: ${missingSections.join(', ')}`,
            );
        }
    }

    // -------------------------------------------------------------------------
    // Preview HTML
    // -------------------------------------------------------------------------

    private buildPreviewHtml(sections: DocumentSection[]): string {
        const sectionsHtml = sections
            .map((section) => this.buildSectionHtml(section))
            .join('\n');

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>Preview do documento</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            line-height: 1.65;
            margin: 2rem auto;
            max-width: 900px;
            padding: 0 1rem;
            color: #222;
        }

        section {
            margin-bottom: 2rem;
        }

        h1 {
            margin: 0 0 2rem;
        }

        h2 {
            font-size: 1.2rem;
            margin: 0 0 1rem;
            padding-bottom: 0.4rem;
            border-bottom: 1px solid #e5e5e5;
        }

        p {
            margin: 0.7rem 0;
        }

        .section-content {
            font-size: 0.98rem;
        }

        /* Identificação */

        .identification-header {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .identification-header strong {
            font-size: 1rem;
        }

        .identification-table {
            width: 100%;
            border-collapse: collapse;
        }

        .identification-table th,
        .identification-table td {
            border: 1px solid #444;
            padding: 8px 10px;
            text-align: center;
            vertical-align: middle;
        }

        .identification-table th {
            font-size: 0.88rem;
            font-weight: 700;
            background: #f5f5f5;
        }

        .identification-table td {
            font-size: 0.95rem;
        }

        /* Listas */

        ol,
        ul {
            margin: 0.6rem 0 1rem;
            padding-left: 1.8rem;
        }

        li {
            margin-bottom: 0.45rem;
        }

        .program-list {
            padding-left: 1.7rem;
        }

        .program-sublist {
            margin-top: 0.4rem;
            padding-left: 1.8rem;
        }

        .objectives-list {
            margin-top: 0.5rem;
        }

        .continuation {
            display: block;
            margin-top: 0.15rem;
        }

        /* Conteúdo normal */

        .text-block {
            white-space: normal;
        }
    </style>
</head>

<body>
    <h1>Preview do documento</h1>

    ${sectionsHtml}
</body>
</html>`;
    }

    private buildSectionHtml(section: DocumentSection): string {
        switch (section.title) {
            case 'IDENTIFICAÇÃO':
                return this.buildIdentificationTable(section.content);

            case 'OBJETIVOS':
                return this.buildObjectivesSection(section);

            case 'PROGRAMA':
                return this.buildProgramSection(section);

            default:
                return this.buildDefaultSection(section);
        }
    }

    // -------------------------------------------------------------------------
    // Identificação
    // -------------------------------------------------------------------------

    private buildIdentificationTable(content: string): string {
        const lines = this.getNonEmptyLines(content);

        const codeAndComponentIndex = this.findLineIndex(lines, 'CÓDIGO:');

        const codeAndComponentValues = this.getNextLine(
            lines,
            codeAndComponentIndex,
        );

        const [code = '', component = ''] = this.splitColumns(
            codeAndComponentValues,
        );

        const academicIndex = this.findLineIndex(
            lines,
            'UNIDADE ACADÊMICA OFERTANTE:',
        );

        const academicValues = this.getNextLine(lines, academicIndex);

        const [academicUnit = '', sigla = ''] =
            this.splitColumns(academicValues);

        const workloadIndex = this.findLineIndex(lines, 'CH TOTAL TEÓRICA:');

        const workloadValues = this.getNextLine(lines, workloadIndex);

        const [theoretical = '', practical = '', total = ''] =
            this.splitColumns(workloadValues);

        return `
<section>
    <h2>0. IDENTIFICAÇÃO</h2>

    <div class="identification-header">
        <strong>UNIVERSIDADE FEDERAL DE UBERLÂNDIA</strong>
        <span>FICHA DE COMPONENTE CURRICULAR</span>
    </div>

    <table class="identification-table">
        <tbody>
            <tr>
                <th>CÓDIGO</th>
                <th colspan="2">COMPONENTE CURRICULAR</th>
            </tr>

            <tr>
                <td>${this.escapeHtml(code)}</td>
                <td colspan="2">${this.escapeHtml(component)}</td>
            </tr>

            <tr>
                <th colspan="2">
                    UNIDADE ACADÊMICA OFERTANTE
                </th>
                <th>SIGLA</th>
            </tr>

            <tr>
                <td colspan="2">
                    ${this.escapeHtml(academicUnit)}
                </td>
                <td>${this.escapeHtml(sigla)}</td>
            </tr>

            <tr>
                <th>CH TOTAL TEÓRICA</th>
                <th>CH TOTAL PRÁTICA</th>
                <th>CH TOTAL</th>
            </tr>

            <tr>
                <td>${this.escapeHtml(theoretical)}</td>
                <td>${this.escapeHtml(practical)}</td>
                <td>${this.escapeHtml(total)}</td>
            </tr>
        </tbody>
    </table>
</section>`;
    }

    private findLineIndex(lines: string[], prefix: string): number {
        return lines.findIndex((line) => line.startsWith(prefix));
    }

    private getNextLine(lines: string[], index: number): string {
        if (index < 0) {
            return '';
        }

        return lines[index + 1] ?? '';
    }

    /**
     * O LiteParse mantém vários espaços entre as "colunas" da tabela.
     * Esses espaços são usados para recuperar os valores.
     */
    private splitColumns(value: string): string[] {
        return value
            .split(/\s{2,}/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    // -------------------------------------------------------------------------
    // Objetivos
    // -------------------------------------------------------------------------

    private buildObjectivesSection(section: DocumentSection): string {
        const lines = this.getNonEmptyLines(section.content);

        const specificIndex = lines.findIndex((line) =>
            /^Específicos\s*:/i.test(line),
        );

        if (specificIndex < 0) {
            return this.buildDefaultSection(section);
        }

        const generalLines = lines.slice(0, specificIndex);

        const specificLines = lines.slice(specificIndex + 1);

        const generalHtml = this.buildJoinedParagraph(generalLines);

        const specificItems = this.buildObjectiveItems(specificLines);

        return `
<section>
    <h2>
        ${section.number}.
        ${this.escapeHtml(section.title)}
    </h2>

    <div class="section-content">
        ${generalHtml}

        <p><strong>Específicos:</strong></p>

        <ul class="objectives-list">
            ${specificItems}
        </ul>
    </div>
</section>`;
    }

    /**
     * Os objetivos específicos normalmente terminam em ";"
     * e o último em ".". Linhas quebradas pelo PDF são unidas.
     */
    private buildObjectiveItems(lines: string[]): string {
        const items: string[] = [];

        let current = '';

        for (const line of lines) {
            current = current ? `${current} ${line}` : line;

            if (/[;.]\s*$/.test(line)) {
                items.push(current.trim());
                current = '';
            }
        }

        if (current) {
            items.push(current.trim());
        }

        return items
            .map((item) => `<li>${this.escapeHtml(item)}</li>`)
            .join('');
    }

    // -------------------------------------------------------------------------
    // Programa
    // -------------------------------------------------------------------------

    private buildProgramSection(section: DocumentSection): string {
        const lines = this.getNonEmptyLines(section.content);

        return `
<section>
    <h2>
        ${section.number}.
        ${this.escapeHtml(section.title)}
    </h2>

    <div class="section-content">
        ${this.buildNumberedHierarchy(lines)}
    </div>
</section>`;
    }

    /**
     * Reconhece:
     *
     * 1. Item principal
     * 1.1. Subitem
     * 1.2. Subitem
     * 2. Outro item
     */
    private buildNumberedHierarchy(lines: string[]): string {
        const groups: Array<{
            text: string;
            children: string[];
        }> = [];

        let currentGroup:
            | {
                  text: string;
                  children: string[];
              }
            | undefined;

        let currentChildIndex = -1;

        for (const line of lines) {
            const childMatch = line.match(/^\d+\.\d+\.\s+(.*)$/);

            if (childMatch) {
                if (!currentGroup) {
                    continue;
                }

                currentGroup.children.push(childMatch[1]);

                currentChildIndex = currentGroup.children.length - 1;

                continue;
            }

            const parentMatch = line.match(/^\d+\.\s+(.*)$/);

            if (parentMatch) {
                currentGroup = {
                    text: parentMatch[1],
                    children: [],
                };

                groups.push(currentGroup);

                currentChildIndex = -1;

                continue;
            }

            // Linha de continuação produzida pela quebra visual do PDF.
            if (currentGroup && currentChildIndex >= 0) {
                currentGroup.children[currentChildIndex] += ` ${line}`;

                continue;
            }

            if (currentGroup) {
                currentGroup.text += ` ${line}`;
            }
        }

        return `
<ol class="program-list">
    ${groups.map((group) => this.buildProgramGroup(group)).join('')}
</ol>`;
    }

    private buildProgramGroup(group: {
        text: string;
        children: string[];
    }): string {
        const childrenHtml =
            group.children.length > 0
                ? `
                    <ol class="program-sublist">
                        ${group.children
                            .map(
                                (child) => `<li>${this.escapeHtml(child)}</li>`,
                            )
                            .join('')}
                    </ol>
                `
                : '';

        return `
<li>
    ${this.escapeHtml(group.text)}
    ${childrenHtml}
</li>`;
    }

    // -------------------------------------------------------------------------
    // Seções comuns
    // -------------------------------------------------------------------------

    private buildDefaultSection(section: DocumentSection): string {
        return `
<section>
    <h2>
        ${section.number}.
        ${this.escapeHtml(section.title)}
    </h2>

    <div class="section-content text-block">
        ${this.buildParagraphs(section.content)}
    </div>
</section>`;
    }

    private buildParagraphs(content: string): string {
        const paragraphs = content
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

        return paragraphs
            .map((paragraph) => {
                const normalized = paragraph
                    .split('\n')
                    .map((line) => line.trim())
                    .join(' ');

                return `<p>${this.escapeHtml(normalized)}</p>`;
            })
            .join('');
    }

    private buildJoinedParagraph(lines: string[]): string {
        if (lines.length === 0) {
            return '';
        }

        const content = lines.join(' ');

        const generalMatch = content.match(/^Geral\s*:\s*(.*)$/i);

        if (generalMatch) {
            return `
<p>
    <strong>Geral:</strong>
    ${this.escapeHtml(generalMatch[1])}
</p>`;
        }

        return `<p>${this.escapeHtml(content)}</p>`;
    }

    // -------------------------------------------------------------------------
    // Utilitários
    // -------------------------------------------------------------------------

    private getNonEmptyLines(content: string): string[] {
        return content
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
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
