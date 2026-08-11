import { Injectable } from '@nestjs/common';
import { UserDTO, UserReqDTO } from './user.dto';
import { v4 as uuid } from 'uuid';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { userMock } from './user.mock';

@Injectable()
export class UserService {
    private readonly users: UserDTO[] = userMock;

    create(newUser: UserReqDTO): string {
        const userDto: UserDTO = {
            id: uuid(),
            username: newUser.username,
            password: bcryptHashSync(newUser.password, 10),
        };

        this.users.push(userDto);
        return 'Usuário criado com sucesso';
    }

    findByUsername(username: string): UserDTO | undefined {
        return this.users.find((user) => user.username === username);
    }
}
