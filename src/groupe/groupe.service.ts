import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Groupe, Prisma, User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GroupeService {
  constructor(private readonly prisma: PrismaService,
    private readonly userService: UsersService
  ) {}

  async isOwner(userProfile: User, groupeName: string) : Promise<boolean> {
    return this.prisma.groupe.findFirst({
      where: {
        ownerId: userProfile.id,
        nom: groupeName,
      },
    }).then((groupe) => {
      return !!groupe;
    });
  }

  async isSuperUser(userProfile: User, groupeName: string) : Promise<boolean> {
    return this.prisma.groupe.findFirst({
      where: {
        superUsers: {
          some: {
            id: userProfile.id,
          },
        },
        nom: groupeName,
      },
    }).then((groupe) => {
      return !!groupe;
    });
  }

  async isInGroupe(userProfile: any, groupeName: string) : Promise<boolean> {
    return this.prisma.groupe.findFirst({
      where: {
        users: {
          some: {
            id: userProfile.id,
          },
        },
        nom: groupeName,
      },
    }).then((groupe) => {
      return !!groupe;
    });
  }
  async createSuperUserGroupe(groupeName: string, nickname: string) : Promise<boolean> {
    const userProfile = await this.userService.findOneByNickname(nickname);
    if (!userProfile) {
      return false;
    }

    console.log(userProfile);
    return this.prisma.groupe.update({
      where: { nom: groupeName },
      data: {
      superUsers: {
        connect: { id: userProfile.id },
      },
      },
    }).then((groupe) => {
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

  async addOrCreateGroupe(groupe: string, user: User) {
    const groupeExist = await this.findByName(groupe);
    if (groupeExist) {
      return await this.prisma.groupe.update({
        where: { id: groupeExist.id },
        data: { users: { connect: user } },
      });
    } else {
      return await this.prisma.groupe.create({
        data: { nom: groupe, users: { connect: user }, ownerId: user.id },
      });
    }
  }
}
