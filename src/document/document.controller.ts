import { Body, Controller, Post } from '@nestjs/common';
import { DocumentReqDTO } from './DocumentReqDTO';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    create(@Body() document: DocumentReqDTO): string {
        return this.documentService.create(document);
    }
}
