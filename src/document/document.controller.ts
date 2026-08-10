import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { DocumentReqDTO } from './DocumentReqDTO';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    create(@Body() document: DocumentReqDTO): string {
        return this.documentService.create(document);
    }

    @Get()
    findAll(): DocumentReqDTO[] {
        return this.documentService.findAll();
    }

    @Get('/:id')
    findById(@Param('id') id: string): DocumentReqDTO | undefined {
        return this.documentService.findById(id);
    }

    @Patch('/:id')
    update(
        @Param('id') id: string,
        @Body() updatedDocument: DocumentReqDTO,
    ): string {
        return this.documentService.update(id, updatedDocument);
    }

    @Delete('/:id')
    delete(@Param('id') id: string): string {
        return this.documentService.delete(id);
    }
}
