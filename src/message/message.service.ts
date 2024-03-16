import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(message: CreateMessageDto): Promise<Message> {
    return this.prisma.message.create({ data: {
      ...message,
      author: {
        connect: { id: message.author.id }
      },
      groupe: {
        connect: { id: message.groupe.id }
      }
      }
    })
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
  
  async findAllByGroup(nom: string) {
    const groupe = await this.prisma.groupe.findUnique({ where: { nom } });
    return this.prisma.message.findMany({ 
      where: { groupeId: groupe.id },
    orderBy: { timestamp: 'asc' },
    select: {
      id: false,
      contenu: true,
      timestamp: true,
      authorId: true,
      groupeId: false,
    }
    })
    .then(messages => Promise.all(messages.map(async message => { 
      const author = await this.prisma.user.findUnique({ where: { id: message.authorId } });
      return (
        {
        contenu: message.contenu,
        timestamp: message.timestamp.toString(),
        author: author.nickname
        }
      )
    })));
  }
}
