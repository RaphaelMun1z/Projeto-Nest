import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResDTO } from './auth.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private jwtExpirationTimeInSeconds: number;

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.jwtExpirationTimeInSeconds = +(
            this.configService.get<number>('JWT_EXPIRATION_TIME') ?? 0
        );
    }

    async signIn(username: string, password: string): Promise<AuthResDTO> {
        const foundUser = await this.userService.findByUsername(username);

        if (!foundUser || !bcryptCompareSync(password, foundUser.password)) {
            throw new UnauthorizedException();
        }

        const payload = { sub: foundUser.id, username: foundUser.username };
        const token = this.jwtService.sign(payload, {
            expiresIn: this.jwtExpirationTimeInSeconds,
        });

        return { token, expiresIn: this.jwtExpirationTimeInSeconds };
    }
}
