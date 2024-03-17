import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Headers,
  Patch,
  Post,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
// import { AuthService } from 'src/auth/auth.service';
import { UsersService } from './users.service';
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    // private readonly authService: AuthService,
  ) {}

  @Post()
  async createUser(
    @Body('password') password: string,
    @Body('email') email: string,
    @Body('nickname') nickname: string,
  ): Promise<Omit<User, 'password'>> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user: Prisma.UserCreateInput = {
      email: email,
      nickname: nickname,
      password: hashedPassword,
    };
    const result = await this.usersService.create(user);
    return result;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const user = await this.usersService.findOneById(Number(id));
    if (!user) {
      throw new HttpException(
        'User id: ' + id + ' not found',
        HttpStatus.NOT_FOUND,
      );
    }
    user.user.password = null;
    return user;
  }

  @Get('getGroupes/:id')
  async findGroupesByUserId(@Param('id') id: string) {
    return this.usersService.findGroupesByUserId(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      updateUserDto.password,
      saltOrRounds,
    );
    updateUserDto.password = hashedPassword;
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
