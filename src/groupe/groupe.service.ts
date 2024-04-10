import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Groupe, Prisma, TimedOut, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GroupeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async isOwner(userProfile: User, groupeName: string): Promise<boolean> {
    return this.prisma.groupe
      .findFirst({
        where: {
          ownerId: userProfile.id,
          nom: groupeName,
        },
      })
      .then((groupe) => {
        return !!groupe;
      });
  }

  async isSuperUser(userProfile: User, groupeName: string): Promise<boolean> {
    return this.prisma.groupe
      .findFirst({
        where: {
          superUsers: {
            some: {
              id: userProfile.id,
            },
          },
          nom: groupeName,
        },
      })
      .then((groupe) => {
        return !!groupe;
      });
  }

  async isInGroupe(userProfile: User, groupeName: string): Promise<boolean> {
    return this.prisma.groupe
      .findFirst({
        where: {
          users: {
            some: {
              id: userProfile.id,
            },
          },
          nom: groupeName,
        },
      })
      .then((groupe) => {
        return !!groupe;
      });
  }
  async createSuperUserGroupe(
    groupeName: string,
    nickname: string,
  ): Promise<boolean> {
    const userProfile = await this.userService.findOneByNickname(nickname);
    if (!userProfile) {
      return false;
    }

    return this.prisma.groupe
      .update({
        where: { nom: groupeName },
        data: {
          superUsers: {
            connect: { id: userProfile.id },
          },
        },
      })
      .then((groupe) => {
        return !!groupe;
      });
  }

  async findByName(groupe: string) {
    return await this.prisma.groupe.findFirst({ where: { nom: groupe } });
  }

  async findOne(id: number) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id } });
    if (!groupe) {
      throw new HttpException(
        `Groupe with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return groupe;
  }

  async findUsersByGroupeId(id: number) {
    return this.prisma.groupe.findFirst({ where: { id } }).users();
  }

  async findGroupesByUserId(id: number): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({
      where: {
        users: {
          some: {
            id,
          },
        },
      },
    });
  }

  async findGroupesById(id: number): Promise<Groupe> {
    return this.prisma.groupe.findFirst({ where: { id } });
  }

  async update(id: number, groupe: Prisma.GroupeUpdateInput) {
    return await this.prisma.groupe.update({ where: { id }, data: groupe });
  }

  async remove(id: number) {
    return await this.prisma.groupe.delete({ where: { id } });
  }

  async addOrCreateGroupe(name: string, user: User) {
    // Check if the group already exists
    const groupeExist = await this.findByName(name);

    // If the group exists, add the user to the group else create the group
    if (groupeExist) {
      const users = await this.findUsersByGroupeId(groupeExist.id);
      // Check if the user is already in the group
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === user.id) {
          throw new HttpException(
            'User already in the group',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      return await this.prisma.groupe.update({
        where: { id: groupeExist.id },
        data: { users: { connect: user } },
      });
    } else {
      return await this.prisma.groupe.create({
        data: { nom: name, users: { connect: user }, ownerId: user.id },
      });
    }
  }

  async findGroupeUsersFormat(groupe: string) {
    // Get all users in the group
    const users_draft = await this.prisma.groupe
      .findUnique({ where: { nom: groupe } })
      .users();
    const users = users_draft.map((user) => user.nickname);

    // Get owner of the group
    const owner = (
      await this.prisma.groupe.findUnique({ where: { nom: groupe } }).owner()
    ).nickname;

    // Get superUser of the group
    const superUsers_draft = await this.prisma.groupe
      .findUnique({ where: { nom: groupe } })
      .superUsers();
    const superUsers = superUsers_draft.map((user) => user.nickname);

    // Get all timeOut users from the group and check if they are timeOut
    const timeOutUsers = await this.prisma.timedOut
      .findMany({
        where: { groupId: (await this.findByName(groupe)).id },
      })
      .then((timeOutUsers: TimedOut[]) => {
        return timeOutUsers.map((timeOutUser) => {
          if (
            timeOutUser.date.getTime() + Number(timeOutUser.time) <
            Date.now()
          ) {
            return timeOutUser;
          }
        });
      });

    const usersBanned = await Promise.all(
      timeOutUsers.map(async (timeOutUser) => {
        const user = await this.prisma.user.findUnique({
          where: { id: timeOutUser.userId },
        });
        return user.nickname;
      }),
    );

    // Remove timeOut users from users
    for (let i = 0; i < usersBanned.length; i++) {
      const index = users.indexOf(usersBanned[i]);
      if (index > -1) {
        users.splice(index, 1);
      }
    }

    //remove owner from users
    const index = users.indexOf(owner);
    if (index > -1) {
      users.splice(index, 1);
    }

    //remove superUsers from users
    for (let i = 0; i < superUsers.length; i++) {
      const index = users.indexOf(superUsers[i]);
      if (index > -1) {
        users.splice(index, 1);
      }
    }

    return { owner, superUsers, users, timeOut: usersBanned };
  }

  async TimeoutUser(
    groupeName: string,
    nickname: string,
    time: number,
    reason: string,
  ) {
    // Check if the user exists
    const userProfile = await this.userService.findOneByNickname(nickname);
    if (!userProfile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // Check if the user to timeout is the owner or superUser
    if (
      (await this.isSuperUser(userProfile, groupeName)) ||
      (await this.isOwner(userProfile, groupeName))
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Check if the group exists
    const groupe = await this.findByName(groupeName);
    if (!groupe) {
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
    }
    // Check if the user is in the group
    if (!(await this.isInGroupe(userProfile, groupeName))) {
      throw new HttpException('User not in group', HttpStatus.UNAUTHORIZED);
    }

    return this.prisma.timedOut.create({
      data: {
        groupId: groupe.id,
        userId: userProfile.id,
        time: time.toString(),
        reason,
      },
    });
  }

  async removeSuperUserGroupe(groupeName: string, nickname: string) {
    const userProfile = await this.userService.findOneByNickname(nickname);
    if (!userProfile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!(await this.isSuperUser(userProfile, groupeName))) {
      throw new HttpException('User not super user', HttpStatus.NOT_FOUND);
    }

    return this.prisma.groupe
      .update({
        where: { nom: groupeName },
        data: {
          superUsers: {
            disconnect: { id: userProfile.id },
          },
        },
      })
      .then((groupe) => {
        return !!groupe;
      });
  }
}
