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
import { Groupe, Prisma, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { GroupeService } from './groupe.service';
import { UsersService } from 'src/users/users.service';

@Controller('groupe')
export class GroupeController {
  constructor(
    private readonly groupeService: GroupeService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async findGroupesByUserId(@Req() request: Request) {
    const userProfile = request['user'];
    return this.groupeService.findGroupesByUserId(userProfile.id);
  }

  @Get(':name')
  async findOne(@Param('name') name: string, @Req() request: Request) {
    const userProfile: User = request['user'];

    if (!(await this.groupeService.isInGroupe(userProfile, name))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const users = this.groupeService.findGroupeUsersFormat(name);
    return users;
  }

  @Post(':name')
  async createAndJoin(@Param('name') name: string, @Req() request: Request) {
    const userProfile = request['user'];

    const groupe: Groupe = await this.groupeService.addOrCreateGroupe(
      name,
      userProfile,
    );
    return groupe;
  }

  @Patch(':name')
  async update(
    @Param('name') name: string,
    @Body('groupe') groupe: Prisma.GroupeUpdateInput,
    @Req() request: Request,
  ) {
    const userProfile = request['user'];

    // check if the user is the owner
    if (!(await this.groupeService.isOwner(userProfile, name))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.update(name, groupe);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.groupeService.remove(id);
  }

  @Post(':name/superuser')
  async createSuperUserGroupe(
    @Req() request: Request,
    @Param('name') groupeName: string,
    @Body('nickname') nickname: string,
  ) {
    if (!nickname) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    const userProfile = request['user'];
    if (!(await this.groupeService.isInGroupe(userProfile, groupeName))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (
      !(await this.groupeService.isSuperUser(userProfile, groupeName)) &&
      !(await this.groupeService.isOwner(userProfile, groupeName))
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.createSuperUserGroupe(groupeName, nickname);
  }

  @Delete(':name/superuser')
  async removeSuperUserGroupe(
    @Req() request: Request,
    @Param('name') groupeName: string,
    @Body('nickname') nickname: string,
  ) {
    if (!nickname) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    // Check if the user have the right
    const userProfile = request['user'];
    if (!(await this.groupeService.isOwner(userProfile, groupeName))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.removeSuperUserGroupe(groupeName, nickname);
  }

  @Post(':name/timeout')
  async TimeoutUser(
    @Req() request: Request,
    @Param('name') groupeName: string,
    @Body('user') nickname: string,
    @Body('time') time: number,
    @Body('reason') reason: string,
  ) {
    // Check if the user have the right
    const userProfile = request['user'];
    if (
      !(await this.groupeService.isSuperUser(userProfile, groupeName)) &&
      !(await this.groupeService.isOwner(userProfile, groupeName))
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.TimeoutUser(groupeName, nickname, time, reason);
  }

  @Get(':name/superuser')
  async isSuperUser(
    @Req() request: Request,
    @Param('name') groupeName: string,
  ) {
    const userProfile = request['user'];
    return this.groupeService.isSuperUser(userProfile, groupeName);
  }

  @Get(':name/owner')
  async isOwner(@Req() request: Request, @Param('name') groupeName: string) {
    const userProfile = request['user'];
    return this.groupeService.isOwner(userProfile, groupeName);
  }

  @Get(':name/timeout/:user')
  async getTimeout(
    @Req() request: Request,
    @Param('name') groupeName: string,
    @Param('user') nickname: string,
  ) {
    const userProfile = request['user'];
    const user = await this.userService.findOneByNickname(nickname);
    console.log(user);
    if (
      !(await this.groupeService.isSuperUser(userProfile, groupeName)) &&
      !(await this.groupeService.isOwner(userProfile, groupeName)) &&
      !((await user.id) === userProfile.id)
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.isTimeOut(user, groupeName);
  }
}
