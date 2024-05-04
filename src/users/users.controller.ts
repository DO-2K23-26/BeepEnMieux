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
import { Public } from 'src/app.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
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
    @Body('username') username: string,
    @Body('lastname') lastname: string,
    @Body('firstname') firstname: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.create(
      email,
      username,
      password,
      lastname,
      firstname,
    );
    return user;
  }

  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const user: User = req['user'];
    return this.usersService.update(user.id, updateUserDto);
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
