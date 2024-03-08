import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Message } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { id, contenu, groupeId, groupes, createdAt } = createMessageDto;
    return this.prisma.message.create({
      data: { id, contenu, groupeId, groupes, createdAt },
    });
  }

  async findAll(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async findOne(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message | null> {
    return this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    });
  }

  async remove(id: string): Promise<Message | null> {
    return this.prisma.message.delete({ where: { id } });
  }
}
