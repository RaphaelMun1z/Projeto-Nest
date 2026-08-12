import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentReqDTO, UpdateDocumentReqDTO } from './document.dto';
import type {
    DocumentResDTO,
    DocumentListResDTO,
    ExtractedPdfResDTO,
    FindAllParameters,
} from './document.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post('extract')
    @UseInterceptors(FileInterceptor('file'))
    async extract(
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        return await this.documentService.extractPdf(file);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body() document: CreateDocumentReqDTO,
    ) {
        return await this.documentService.create(file, document);
    }

    @Get()
    async findAll(
        @Query() params: FindAllParameters,
    ): Promise<DocumentListResDTO[]> {
        return await this.documentService.findAll(params);
    }

    @Get('/:id')
    async findById(@Param('id') id: string): Promise<DocumentResDTO> {
        return await this.documentService.findById(id);
    }

    @Patch('/:id')
    async update(
        @Param('id') id: string,
        @Body() updatedDocument: UpdateDocumentReqDTO,
    ): Promise<string> {
        return await this.documentService.update(id, updatedDocument);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string): Promise<string> {
        return await this.documentService.delete(id);
    }
}
