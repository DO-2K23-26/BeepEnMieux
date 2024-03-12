import { Injectable } from '@nestjs/common';
import { CreateGroupeDto } from './dto/create-groupe.dto';
import { UpdateGroupeDto } from './dto/update-groupe.dto';
import { PrismaService } from 'src/prisma.service';
import { Groupe } from '@prisma/client';

@Injectable()
export class GroupeService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGroupeDto: CreateGroupeDto) {
    const { id, userIds, nom, messages } = createGroupeDto;
    return this.prisma.groupe.create({
      data: {
        id,
        userIds,
        nom,
        messages: {
          create: messages,
        },
      },
    });
  }

  findAll() {
    return this.prisma.groupe.findMany();
  }

  async findOne(id: string): Promise<Groupe | null> {
    return this.prisma.groupe.findUnique({ where: { id } });
  }

  async update(
    id: string,
    updateGroupeDto: UpdateGroupeDto,
  ): Promise<Groupe | null> {
    return this.prisma.groupe.update({
      where: { id },
      data: updateGroupeDto,
    });
  }

  async remove(id: string): Promise<Groupe | null> {
    return this.prisma.groupe.delete({ where: { id } });
  }
}
