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
import type {
    CreateDocumentReqDTO,
    DocumentResDTO,
    ExtractedPdfResDTO,
    FindAllParameters,
    UpdateDocumentReqDTO,
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
    create(@Body() document: CreateDocumentReqDTO): string {
        return this.documentService.create(document);
    }

    @Get()
    findAll(@Query() params: FindAllParameters): DocumentResDTO[] {
        return this.documentService.findAll(params);
    }

    @Get('/:id')
    findById(@Param('id') id: string): DocumentResDTO | undefined {
        return this.documentService.findById(id);
    }

    @Patch('/:id')
    update(
        @Param('id') id: string,
        @Body() updatedDocument: UpdateDocumentReqDTO,
    ): string {
        return this.documentService.update(id, updatedDocument);
    }

    @Delete('/:id')
    delete(@Param('id') id: string): string {
        return this.documentService.delete(id);
    }
}
