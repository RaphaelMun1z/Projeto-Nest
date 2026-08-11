import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DocumentModule,
        UserModule,
        AuthModule,
        DbModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
