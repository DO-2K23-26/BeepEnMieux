import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  ExecutionContext,
  Req,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GroupeService } from './groupe.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('groupe')
export class GroupeController {
  constructor(
    private readonly groupeService: GroupeService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll() {
    return this.groupeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupeService.findOne(Number(id));
  }

  @Get('getGroupes/')
  async findGroupesByUserId(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new HttpException('Unauthorized', 401);
    }
    const token = authorization.split(' ')[1];
    const userProfile = await this.authService.infoUser(token);
    return this.groupeService.findGroupesByUserId(userProfile.user.id);
  }

  @Post('join/:id')
  async join(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new HttpException('Unauthorized', 401);
    }
    const token = authorization.split(' ')[1];
    const userProfile = await this.authService.infoUser(token);
    if (!userProfile) {
      throw new HttpException('Unauthorized', 401);
    }
    const groupe = await this.groupeService.findByName(id);
    return this.groupeService.addOrCreateGroupe(groupe.nom, userProfile.user);
  }

  @Post('createAndJoin/:id')
  async createAndJoin(@Param('id') id: string, @Req() request: Request) {
    const userProfile = request['user'];
    console.log("Mon user :" + userProfile);
    if (!userProfile) {
      throw new HttpException('Unauthorized', 401);
    }
    await this.groupeService.addOrCreateGroupe(id, userProfile);
    return HttpStatus.CREATED;
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() groupe: Prisma.GroupeUpdateInput) {
    return this.groupeService.update(id, groupe);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.groupeService.remove(id);
  }
}
