import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Server, User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
  constructor(
    private readonly serverService: ServerService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async findServersByUserId(@Req() request: Request) {
    const userProfile: User = request['user'];
    return this.serverService.findServersByUserId(userProfile.id);
  }

  @Get(':name')
  async findOne(@Param('name') name: string, @Req() request: Request) {
    const userProfile: User = request['user'];
    return await this.serverService.findServerUsersFormat(name, userProfile);
  }

  @Post(':name')
  async createAndJoin(
    @Param('name') name: string,
    @Req() request: Request,
  ): Promise<Server | null> {
    const userProfile: User = request['user'];
    return await this.serverService.addOrCreateServer(name, userProfile);
  }

  @Patch(':name')
  async update(
    @Param('name') name: string,
    @Body('server') server: Server,
    @Req() request: Request,
  ) {
    const userProfile: User = request['user'];
    return this.serverService.update(name, server, userProfile);
  }

  @Delete(':id')
  remove(@Req() request: Request, @Param('id') id: number) {
    const userProfile: User = request['user'];
    return this.serverService.remove(id, userProfile);
  }

  @Get(':name/owner')
  async isOwner(@Req() request: Request, @Param('name') serverName: string) {
    const userProfile: User = request['user'];
    return this.serverService.isOwner(userProfile, serverName);
  }

  @Get(':name/timeout/:user')
  async getBanned(
    @Req() request: Request,
    @Param('name') serverName: string,
    @Param('user') username: string,
  ) {
    const userProfile: User = request['user'];
    return this.serverService.isBanned(userProfile, serverName, username);
  }

  @Get(':id/channels')
  async getAllChannels(@Param('id') id: string, @Req() request: Request) {
    const userProfile: User = request['user'];
    return this.serverService.getAllChannels(id, userProfile);
  }
}
