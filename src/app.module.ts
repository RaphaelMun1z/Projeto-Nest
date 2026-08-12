import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DocumentModule,
        DbModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
