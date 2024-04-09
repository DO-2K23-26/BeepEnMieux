import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Groupe, Prisma, User } from '@prisma/client';

@Injectable()
export class GroupeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(groupe: string) {
    return await this.prisma.groupe.findFirst({ where: { nom: groupe } });
  }

  async create(groupe: Prisma.GroupeCreateInput) {
    return await this.prisma.groupe.create({ data: groupe });
  }

  async findAll() {
    return await this.prisma.groupe.findMany();
  }

  async findOne(id: number) {
    const groupe = await this.prisma.groupe.findFirst({ where: { id } });
    if (!groupe) {
      throw new HttpException(`Groupe with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return groupe;
  }

  async update(id: number, groupe: Prisma.GroupeUpdateInput) {
    return await this.prisma.groupe.update({ where: { id }, data: groupe });
  }

  async remove(id: number) {
    return await this.prisma.groupe.delete({ where: { id } });
  }

  async addInGroupe(groupe: Groupe, user: User) {
    return await this.prisma.groupe.update({ where: { id: groupe.id }, data: { users: { connect: user } } });
  }

  async addOrCreateGroupe(groupe: string, user: User) {
    const groupeExist = await this.findByName(groupe);
    if (groupeExist) {
      return await this.prisma.groupe.update({ where: { id: groupeExist.id }, data: { users: { connect: user } } });
    } else {
      return await this.prisma.groupe.create({ data: { nom: groupe, users: { connect: user }, ownerId : user.id } });
    }
  }
}
