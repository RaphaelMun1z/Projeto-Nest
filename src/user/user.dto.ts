import { IsString, MaxLength, MinLength } from 'class-validator';

export class UserReqDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    username!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password!: string;
}

export class UserResDTO {
    @IsString()
    id!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    username!: string;
}
