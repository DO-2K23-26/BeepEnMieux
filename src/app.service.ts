import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';
import { Message } from '@prisma/client';
import { Groupe } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createUser(userData): Promise<User> {
    const result = await this.prisma.user.create({ data: userData });
    return result;
  }

  async createMessage(messageData): Promise<Message> {
    const result = await this.prisma.message.create({ data: messageData });
    return result;
  }

  async createGroupe(groupeData): Promise<Groupe> {
    const result = await this.prisma.groupe.create({ data: groupeData });
    return result;
  }
}
