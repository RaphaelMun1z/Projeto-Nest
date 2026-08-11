import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            global: true,
            imports: [],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: Number(
                        configService.get<number>('JWT_EXPIRATION_TIME') ?? 0,
                    ),
                },
            }),
            inject: [ConfigService],
        }),
        UserModule,
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
