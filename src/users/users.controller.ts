import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Public } from 'src/app.service';
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    // private readonly authService: AuthService,
  ) {}

  @Public()
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto,
  @Req() req: Request) {
    const user = req['user'];
    if (user.id !== Number(id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      updateUserDto.password,
      saltOrRounds,
    );
    updateUserDto.password = hashedPassword;
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string,
  @Req() req: Request){
    const user = req['user'];
    if (user.id !== Number(id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.usersService.remove(Number(id));
  }
}
