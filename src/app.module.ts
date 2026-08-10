import { Module } from '@nestjs/common';
import { AppService } from './app/app.service';
import { DocumentModule } from './document/document.module';
import { AppController } from './app/app.controller';

@Module({
    imports: [DocumentModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
