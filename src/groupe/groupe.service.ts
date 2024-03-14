import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupeService {
  constructor(private readonly prisma: PrismaService) {}

  create(groupe: Prisma.GroupeCreateInput) {
    return this.prisma.groupe.create({ data: groupe });
  }

  findAll() {
    return this.prisma.groupe.findMany();
  }

  async findOne(id: number) {
    const groupe = await this.prisma.groupe.findUnique({ where: { id } });
    if (!groupe) {
      throw new HttpException(`Groupe with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return groupe;
  }

  async update(id: number, groupe: Prisma.GroupeUpdateInput) {
    return this.prisma.groupe.update({ where: { id }, data: groupe });
  }

  async remove(id: number) {
    return this.prisma.groupe.delete({ where: { id } });
  }
}
