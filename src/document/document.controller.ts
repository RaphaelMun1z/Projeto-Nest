import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import type { DocumentReqDTO, FindAllParameters } from './document.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    create(@Body() document: DocumentReqDTO): string {
        return this.documentService.create(document);
    }

    @Get()
    findAll(@Query() params: FindAllParameters): DocumentReqDTO[] {
        return this.documentService.findAll(params);
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
