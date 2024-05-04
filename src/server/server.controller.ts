import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ServerService } from './server.service';
import { UsersService } from 'src/users/users.service';
import { Server, User } from '@prisma/client';

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

    if (!(await this.serverService.isInServer(userProfile, name))) {
      throw new UnauthorizedException();
    }

    const users = this.serverService.findServerUsersFormat(name);
    return users;
  }

  @Post(':name')
  async createAndJoin(
    @Param('name') name: string,
    @Req() request: Request,
  ): Promise<Server | null> {
    const userProfile = request['user'];

    const server: Server = await this.serverService.addOrCreateServer(
      name,
      userProfile,
    );
    return server;
  }

  @Patch(':name')
  async update(
    @Param('name') name: string,
    @Body('server') server: Server,
    @Req() request: Request,
  ) {
    const userProfile = request['user'];

    // check if the user is the owner
    if (!(await this.serverService.isOwner(userProfile, name))) {
      throw new UnauthorizedException();
    }

    return this.serverService.update(name, server);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    //TODO IMPORTANT IL FAUT PROTEGER CETTE ROUTE

    return this.serverService.remove(id);
  }

  @Get(':name/owner')
  async isOwner(@Req() request: Request, @Param('name') serverName: string) {
    const userProfile = request['user'];
    return this.serverService.isOwner(userProfile, serverName);
  }

  @Get(':name/timeout/:user')
  async getBanned(
    @Req() request: Request,
    @Param('name') serverName: string,
    @Param('user') nickname: string,
  ) {
    const userProfile = request['user'];
    const user = await this.userService.findOneByUsername(nickname);
    if (
      //TODO IL FAUT RAJOUTER CHECK DE PERMISSION PAR ROLE
      !(await this.serverService.isOwner(userProfile, serverName)) &&
      user.id !== userProfile.id
    ) {
      throw new UnauthorizedException();
    }

    return this.serverService.isBanned(user, serverName);
  }
}
