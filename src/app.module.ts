import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [DocumentModule, UserModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
