import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Room } from '../shared/interfaces/chat.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body('password') password: string,
    @Body('email') email: string,
  ): Promise<Omit<User, 'password'>> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user: Prisma.UserCreateInput = {
      email: email,
      password: hashedPassword,
    };
    const result = await this.usersService.create(user);
    return result;
  }

  @Get('api/rooms')
  async getAllRooms(): Promise<Room[]> {
    return await this.usersService.getRooms();
  }

  @Get('api/rooms/:room')
  async getRoom(@Param() params): Promise<Room> {
    const rooms = await this.usersService.getRooms();
    const room = await this.usersService.getRoomByName(params.room);
    return rooms[room];
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(updateUserDto.password, saltOrRounds);
    updateUserDto.password = hashedPassword;
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
