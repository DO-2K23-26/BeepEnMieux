import {
  Body,
  Controller,
  Delete,
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
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async createUser(
    @Body('password') password: string,
    @Body('email') email: string,
    @Body('username') username: string,
    @Body('lastname') lastname: string,
    @Body('firstname') firstname: string,
  ): Promise<Omit<User, 'password'>> {
    return await this.usersService.create(
      email,
      username,
      password,
      lastname,
      firstname,
    );
  }

  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const user: User = req['user'];
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user: User = req['user'];
    return this.usersService.remove(Number(id), user);
  }
}
