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
import { Groupe, Prisma } from '@prisma/client';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  @Post(':id')
  async createAndJoin(@Param('id') id: string, @Req() request: Request) {
    const userProfile = request['user'];
    const groupe: Groupe = await this.groupeService.addOrCreateGroupe(id, userProfile);
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
    @Body('nickname') nickname: string)
  {
    const userProfile = request['user'];
    if (!this.groupeService.isInGroupe(userProfile, groupeName)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!this.groupeService.isSuperUser(userProfile, groupeName) && !this.groupeService.isOwner(userProfile, groupeName)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.groupeService.createSuperUserGroupe(groupeName, nickname);
  }
}
