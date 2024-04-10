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

@Controller('groupe')
export class GroupeController {
  constructor(
    private readonly groupeService: GroupeService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async findGroupesByUserId(@Req() request: Request) {
    const userProfile = request['user'];
    return this.groupeService.findGroupesByUserId(userProfile.id);
  }

  @Get(':name')
  async findOne(@Param('name') name: string, @Req() request: Request) {
    const userProfile: User = request['user'];
    const group = await this.groupeService.findByName(name);
    const users_draft = await this.groupeService.findUsersByGroupeId(group.id);

    // Check if the user is in the group
    let userInGroup = false;
    for (let i = 0; i < users_draft.length; i++) {
      if (users_draft[i].id == userProfile.id) {
        userInGroup = true;
      }
    }
    if (!userInGroup) {
      throw new HttpException(
        `User ${userProfile.nickname} is not in the group ${name}`,
        HttpStatus.UNAUTHORIZED,
      );
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

  @Patch(':id')
  update(@Param('id') id: number, @Body() groupe: Prisma.GroupeUpdateInput) {
    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
    /*
    return this.groupeService.update(id, groupe);
    */
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
}
