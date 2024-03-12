import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(message: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({ data: message });
  }

  async findAll(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async findOne(id: number): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  async update(
    id: number,
    message: Prisma.MessageUpdateInput,
  ): Promise<Message> {
    return this.prisma.message.update({ where: { id }, data: message });
  }

  async remove(id: number): Promise<Message | null> {
    return this.prisma.message.delete({ where: { id } });
  }
}