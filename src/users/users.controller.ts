import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { User } from '@prisma/client';
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
    const user = await this.usersService.create(email, nickname, password);
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
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
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];
    if (user.id !== Number(id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.usersService.remove(Number(id));
  }
}
