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
    extract(
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<ExtractedPdfResDTO> {
        return this.documentService.extractPdf(file);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body() document: CreateDocumentReqDTO,
    ) {
        return this.documentService.create(file, document);
    }

    @Get()
    findAll(@Query() params: FindAllParameters): Promise<DocumentListResDTO[]> {
        return this.documentService.findAll(params);
    }

    @Get('/:id')
    findById(@Param('id') id: string): Promise<DocumentResDTO> {
        return this.documentService.findById(id);
    }

    @Patch('/:id')
    update(
        @Param('id') id: string,
        @Body() updatedDocument: UpdateDocumentReqDTO,
    ): Promise<string> {
        return this.documentService.update(id, updatedDocument);
    }

    @Delete('/:id')
    delete(@Param('id') id: string): Promise<string> {
        return this.documentService.delete(id);
    }
}
