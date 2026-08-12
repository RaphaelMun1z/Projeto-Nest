import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { Repository } from 'typeorm';
import { UserReqDTO } from './user.dto';
import { UserEntity } from '../db/entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(
        newUser: UserReqDTO,
    ): Promise<{ id: string; username: string }> {
        const userAlreadyRegistered = await this.findByUsername(
            newUser.username,
        );

        if (userAlreadyRegistered) {
            throw new ConflictException(
                `O usuário "${newUser.username}" já foi cadastrado.`,
            );
        }

        const dbUser = new UserEntity();
        dbUser.username = newUser.username;
        dbUser.password = bcryptHashSync(newUser.password, 10);

        const { id, username } = await this.userRepository.save(dbUser);

        return { id, username };
    }

    async findByUsername(
        username: string,
    ): Promise<{ id: string; username: string; password: string } | null> {
        const userFound = await this.userRepository.findOne({
            where: { username },
        });

        if (!userFound) {
            return null;
        }

        return {
            id: userFound.id,
            username: userFound.username,
            password: userFound.password,
        };
    }
}
