import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DocumentSection, ExtractedPdfResDTO } from './document.dto';

// Carrega o LiteParse dinamicamente para evitar conflito com o CommonJS.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const loadLiteParse = new Function(
    'return import("@llamaindex/liteparse")',
) as () => Promise<typeof import('@llamaindex/liteparse')>;

@Injectable()
export class PdfTextExtractor {
    private readonly logger = new Logger(PdfTextExtractor.name);
    private readonly maxPdfSizeBytes = 10 * 1024 * 1024;

    private readonly expectedSections = [
        'IDENTIFICAÇÃO',
        'OBJETIVOS',
        'EMENTA',
        'PROGRAMA',
        'BIBLIOGRAFIA BÁSICA',
        'BIBLIOGRAFIA COMPLEMENTAR',
        'APROVAÇÃO',
    ];

    async extract(file: Express.Multer.File): Promise<ExtractedPdfResDTO> {
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

            this.logger.debug(
                `Extração concluída: arquivo=${file.originalname}, páginas=${result.pages.length}`,
            );

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

    /* validation is handled by PdfValidationService */
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

                // Remove a URL de impressão presente no topo ou rodapé das páginas.
                .filter((line) => !this.isSeiPrintUrl(line))

                // Remove indicadores de página como "1/4" e "2/4".
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

    /** Separa o cabeçalho da ficha antes da primeira seção numerada. */
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

        /* Organiza a identificação do documento. */

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

        /* Organiza as listas do documento. */

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

        /* Organiza o conteúdo normal. */

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

    /** Separa as colunas preservadas pelo LiteParse pelos espaços consecutivos. */
    private splitColumns(value: string): string[] {
        return value
            .split(/\s{2,}/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

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

    /** Une as linhas quebradas e separa os objetivos por ponto e vírgula ou ponto. */
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

    /** Organiza itens principais e subitens numerados em uma hierarquia HTML. */
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

            // Une a linha de continuação produzida pela quebra visual do PDF.
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
