import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Message, Prisma, User } from '@prisma/client';
import { ServerService } from 'src/server/server.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChannelService } from 'src/channel/channel.service';
import { MessageEntity } from './dto/reponse.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serverService: ServerService,
    private readonly channelService: ChannelService,
  ) {}

  async create(message: CreateMessageDto): Promise<Message> {
    return this.prisma.message.create({
      data: {
        ...message,
        author: {
          connect: { id: message.author.id },
        },
        channel: {
          connect: { id: message.channel.id },
        },
      },
    });
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

  async updateContenu(id: number, contenu: string): Promise<Message> {
    return this.prisma.message.update({ where: { id }, data: { contenu } });
  }

  async remove(id: number): Promise<Message | null> {
    return this.prisma.message.delete({ where: { id } });
  }

  async findMessagesByChannelId(
    channelId: number,
    serverId: string,
    user: User,
  ): Promise<MessageEntity[]> {
    // Check if server exists
    const server = await this.serverService.findById(serverId);
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if user is in server
    if (await this.serverService.isInServer(user, server.nom)) {
      throw new UnauthorizedException('User is not in server');
    }

    // Check if channel exists
    const channel = await this.channelService.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if channel is in server
    if (channel.serverId !== server.id) {
      throw new UnauthorizedException('Channel is not in server');
    }

    const message = await this.prisma.message.findMany({
      where: { channelId },
      orderBy: { timestamp: 'asc' },
    });

    return message.map((m) => {
      return {
        id: m.id,
        ownerId: m.authorId,
        content: m.contenu,
        channelId: m.channelId,
        timestamp: m.timestamp,
      };
    });
  }
}
