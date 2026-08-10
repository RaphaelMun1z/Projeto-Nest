import { Injectable } from '@nestjs/common';
import { UserReqDTO } from './user.dto';
import { v4 as uuid } from 'uuid';
import { hashSync as bcryptHashSync } from 'bcrypt';

@Injectable()
export class UserService {
    private readonly users: UserReqDTO[] = [
        {
            id: '1',
            username: 'ana.silva',
            password: '550e8400-e29b-41d4-a716-446655440001',
        },
        {
            id: '2',
            username: 'bruno.santos',
            password: '550e8400-e29b-41d4-a716-446655440002',
        },
        {
            id: '3',
            username: 'carla.oliveira',
            password: '550e8400-e29b-41d4-a716-446655440003',
        },
        {
            id: '4',
            username: 'diego.costa',
            password: '550e8400-e29b-41d4-a716-446655440004',
        },
        {
            id: '5',
            username: 'elisa.almeida',
            password: '550e8400-e29b-41d4-a716-446655440005',
        },
        {
            id: '6',
            username: 'fabio.rocha',
            password: '550e8400-e29b-41d4-a716-446655440006',
        },
        {
            id: '7',
            username: 'gabriela.lima',
            password: '550e8400-e29b-41d4-a716-446655440007',
        },
        {
            id: '8',
            username: 'henrique.martins',
            password: '550e8400-e29b-41d4-a716-446655440008',
        },
        {
            id: '9',
            username: 'isabela.ferreira',
            password: '550e8400-e29b-41d4-a716-446655440009',
        },
        {
            id: '10',
            username: 'joao.pereira',
            password: '550e8400-e29b-41d4-a716-446655440010',
        },
    ];

    create(newUser: UserReqDTO): string {
        newUser.id = uuid();
        newUser.password = bcryptHashSync(newUser.password, 10);
        this.users.push(newUser);
        return 'Usuário criado com sucesso';
    }
}
