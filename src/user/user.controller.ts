import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserReqDTO } from './user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async create(
        @Body() user: UserReqDTO,
    ): Promise<{ id: string; username: string }> {
        return await this.userService.create(user);
    }
}
