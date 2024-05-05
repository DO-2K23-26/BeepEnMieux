import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Server, User, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { UpdateServerDto } from './dto/updateServer.dto';

@Injectable()
export class ServerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}
  async addOrCreateServer(name: string, userProfile: User): Promise<Server> {
    const serverExist = await this.findByName(name);

    // If the group exists, add the user to the group else create the group
    if (serverExist) {
      const users = await this.findUsersByServerId(serverExist.id);
      // Check if the user is already in the group
      for (const element of users) {
        if (element.id === userProfile.id) {
          throw new HttpException(
            'User already in the group',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      return await this.prisma.server.update({
        where: { id: serverExist.id },
        data: { users: { connect: userProfile } },
      });
    } else {
      return await this.prisma.server.create({
        data: {
          nom: name,
          users: { connect: userProfile },
          ownerId: userProfile.id,
        },
      });
    }
  }

  async findUsersByServerId(id: number): Promise<User[]> {
    return this.prisma.server.findFirst({ where: { id } }).users();
  }

  async findByName(name: string): Promise<Server> {
    return await this.prisma.server.findFirst({ where: { nom: name } });
  }

  async findServerUsersFormat(name: string, userProfile: User) {
    const server = await this.findByName(name);

    if (!(await this.isInServer(userProfile, name))) {
      throw new UnauthorizedException();
    }

    const users_draft = await this.prisma.server
      .findUnique({ where: { nom: name } })
      .users();
    const users = users_draft.map((user) => user.username);

    const owner = (
      await this.prisma.server.findUnique({ where: { nom: name } }).owner()
    ).username;

    // Get superUser of the group
    const roles_draft = await this.prisma.server
      .findUnique({ where: { nom: name } })
      .roles();
    const admins: string[] = [];
    await Promise.all(
      roles_draft.map(async (role) => {
        if (role.isAdmin) {
          this.prisma.user.findMany({ where: role }).then((users) =>
            users.forEach((elem) => {
              admins.fill(elem.username);
            }),
          );
        }
      }),
    );

    // Check if the user is timeOut
    const usersBanned = [];
    for (const element of users_draft) {
      const bannedUsers = await this.prisma.banned.findMany({
        where: { userId: element.id, serverId: server.id },
      });

      for (const row of bannedUsers) {
        if (row.date.getTime() + Number(row.time) * 1000 > Date.now()) {
          users.splice(users.indexOf(element.username), 1);
          usersBanned.push(element);
        }
      }
    }

    //remove owner from users
    const index = users.indexOf(owner);
    if (index > -1) {
      users.splice(index, 1);
    }

    //remove superUsers from users
    for (const element of admins) {
      const index = users.indexOf(element);
      if (index > -1) {
        users.splice(index, 1);
      }
    }

    return { owner, admins, users, banned: usersBanned };
  }

  async isBanned(user: User, serverName: string, username: string) {
    const userProfile = await this.userService.findOneByUsername(username);
    if (
      (!(await this.isOwner(userProfile, serverName)) ||
        !(await this.isSuperUser(userProfile, serverName))) &&
      user.id !== userProfile.id
    ) {
      throw new UnauthorizedException();
    }

    const server = await this.findByName(serverName);
    if (!server) {
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
    }

    if (!(await this.isInServer(user, serverName))) {
      throw new HttpException('User not in group', HttpStatus.UNAUTHORIZED);
    }

    const bannedUsers = await this.prisma.banned.findMany({
      where: { serverId: server.id },
    });

    for (const element of bannedUsers) {
      if (
        element.userId === user.id &&
        element.date.getTime() + Number(element.time) * 1000 > Date.now()
      ) {
        return true;
      }
    }
    return false;
  }

  async removeRoleServer(
    serverName: string,
    username: string,
    role: Role,
  ): Promise<boolean> {
    const userProfile = await this.userService.findOneByUsername(username);
    if (!userProfile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!(await this.isRole(username, role))) {
      return false;
    }
    await this.prisma.user.update({
      where: { username: username },
      data: { roles: { disconnect: role } },
    });
    return true;
  }

  async addRoleServer(
    serverName: string,
    username: string,
    role: Role,
  ): Promise<boolean> {
    const userProfile = await this.userService.findOneByUsername(username);
    if (!userProfile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (await this.isRole(username, role)) {
      return false;
    }
    await this.prisma.user.update({
      where: { username: username },
      data: { roles: { connect: role } },
    });
    return true;
  }

  async isRole(username: string, role: Role): Promise<boolean> {
    const user = await this.userService.findOneByUsername(username);
    const roles = await this.prisma.user
      .findUnique({ where: { id: user.id } })
      .roles();
    for (const element of roles) {
      if (element.id === role.id) {
        return true;
      }
    }
    return false;
  }

  async remove(id: number, userProfile: User): Promise<Server> {
    const serv = await this.prisma.server.findUnique({
      where: { id: parseInt(String(id)) },
    });
    if (!serv) {
      throw new NotFoundException('Server not found');
    }
    if (!(await this.isOwner(userProfile, serv.nom))) {
      throw new UnauthorizedException('User not owner');
    }
    return this.prisma.server.delete({ where: { id: parseInt(String(id)) } });
  }

  async update(name: string, newServer: UpdateServerDto, userProfile: User) {
    // check if the server exists
    if (this.findByName(name) == null) {
      throw new NotFoundException('Server not found');
    }

    // check if the user is the owner
    if (!(await this.isOwner(userProfile, name))) {
      throw new UnauthorizedException();
    }

    return await this.prisma.server.update({
      where: { nom: name },
      data: newServer,
    });
  }
  async isOwner(userProfile: User, name: string): Promise<boolean> {
    // check if the server exists
    const server = await this.findByName(name);

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.ownerId === userProfile.id) {
      return true;
    } else {
      return false;
    }
  }

  async isInServer(userProfile: User, name: string): Promise<boolean> {
    return this.prisma.server
      .findFirst({ where: { nom: name } })
      .users()
      .then((users) => {
        if (!users) return false;
        return users.some((element) => element.id === userProfile.id);
      });
  }
  // TODO: Remove one of isInServerId and isInServer
  async isInServerId(userProfile: User, id: string): Promise<boolean> {
    return this.prisma.server
      .findFirst({ where: { id: parseInt(id) } })
      .users()
      .then((users) => {
        if (!users) return false;
        return users.some((element) => element.id === userProfile.id);
      });
  }

  async findServersByUserId(
    id: any,
  ): Promise<{ id: number; name: string; owner_id: string }[]> {
    return Promise.all(
      (
        await this.prisma.server.findMany({
          where: { users: { some: { id } } },
        })
      ).map(async (server) => {
        return {
          id: server.id,
          name: server.nom,
          owner_id: await this.userService
            .findOneById(server.ownerId)
            .then((user) => {
              return user.user.username;
            }),
        };
      }),
    );
  }

  async getAllChannels(serverId: string, user: User) {
    // check if the user is in the group
    if (!(await this.isInServerId(user, serverId))) {
      throw new HttpException('User not in group', HttpStatus.UNAUTHORIZED);
    }

    return this.prisma.server
      .findUnique({ where: { id: Number(serverId) } })
      .channels()
      .then((channels) => {
        return channels.map((channel) => {
          return {
            id: channel.id,
            name: channel.nom,
            server_id: channel.serverId,
            type: 'TEXT',
          };
        });
      });
  }

  async isSuperUser(user: User, serverName: string) {
    const server = await this.findByName(serverName);
    if (!server) {
      throw new HttpException('Server not found', HttpStatus.NOT_FOUND);
    }

    if (!(await this.isInServer(user, serverName))) {
      throw new HttpException('User not in server', HttpStatus.UNAUTHORIZED);
    }

    const userRoles = await this.prisma.user
      .findUnique({
        where: { id: user.id },
      })
      .roles();

    for (const role of userRoles) {
      if (
        (
          await this.prisma.role.findUnique({
            where: { id: role.id },
          })
        ).isAdmin
      ) {
        return true;
      }
    }

    return false;
  }

  async findById(id: string) {
    return this.prisma.server.findUnique({ where: { id: parseInt(id) } });
  }
}
