import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './users.model';
import { Room } from '../shared/interfaces/chat.interface';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/signup')
    async createUser(
        @Body('password') password: string,
        @Body('username') username: string,
    ): Promise<UserModel> {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        const result = await this.usersService.createUser(
            username,
            hashedPassword,
        );
        return result;
    }

    @Get('api/rooms')
    async getAllRooms(): Promise<Room[]> {
        return await this.usersService.getRooms()
    }

    @Get('api/rooms/:room')
    async getRoom(@Param() params): Promise<Room> {
        const rooms = await this.usersService.getRooms()
        const room = await this.usersService.getRoomByName(params.room)
        return rooms[room]
    }
}