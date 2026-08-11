import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { UserDTO, UserReqDTO } from './user.dto';
import { UserEntity } from '../db/entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(newUser: UserReqDTO): Promise<string> {
        const existingUser = await this.userRepository.findOneBy({
            username: newUser.username,
        });

        if (existingUser) {
            throw new ConflictException(
                `O nome de usuário "${newUser.username}" já está cadastrado.`,
            );
        }

        try {
            await this.userRepository.save({
                username: newUser.username,
                password: bcryptHashSync(newUser.password, 10),
            });
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                (error.driverError as { code?: string }).code === '23505'
            ) {
                throw new ConflictException(
                    `O nome de usuário "${newUser.username}" já está cadastrado.`,
                );
            }

            throw error;
        }

        return 'Usuário criado com sucesso';
    }

    findByUsername(username: string): Promise<UserDTO | null> {
        return this.userRepository.findOneBy({ username });
    }
}
