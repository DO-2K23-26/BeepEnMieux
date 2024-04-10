import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Groupe, Prisma, User } from '@prisma/client';

@Injectable()
export class GroupeService {
  constructor(private readonly prisma: PrismaService) {}

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
