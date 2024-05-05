import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Channel, Server, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto } from './dto/createChannelDto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}
  async isTimeOut(author: User, channelId: number) {
    const channel = await this.findById(channelId);
    return this.prisma.timedOut.findFirst({
      where: {
        userId: author.id,
        channelId: channel.id,
      },
    });
  }
  findById(channelId: number): Promise<Channel> {
    return this.prisma.channel.findUnique({
      where: { id: parseInt(String(channelId)) },
    });
  }
  /*
  TODO: Implement the following methods
  findMessagesByChannelId(id: any):
    | {
        id: number;
        contenu: string;
        authorId: number;
        channelId: number;
        timestamp: Date;
      }[]
    | PromiseLike<
        {
          id: number;
          contenu: string;
          authorId: number;
          channelId: number;
          timestamp: Date;
        }[]
      > {
    throw new Error('Method not implemented.');
  }
  findOne(
    id: any,
  ):
    | { id: number; nom: string; serverId: number }
    | PromiseLike<{ id: number; nom: string; serverId: number }> {
    throw new Error('Method not implemented.');
  }
  findChannelsByServerId(id: any): Promise<Channel[]> {
    throw new Error('Method not implemented.');
  }*/
  findServerByChannelId(id: any): Promise<Server> {
    return this.prisma.channel.findUnique({ where: { id } }).server();
  }

  async createChannel(newChannel: CreateChannelDto): Promise<Channel> {
    // Check if the server exists
    const server = await this.prisma.server.findUnique({
      where: { id: newChannel.serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if the channel already exists in the server
    const existingChannel = await this.prisma.channel.findFirst({
      where: { nom: newChannel.nom, serverId: newChannel.serverId },
    });

    if (existingChannel) {
      throw new ConflictException('Channel already exists in the server');
    }

    // Create the channel
    return await this.prisma.channel.create({
      data: {
        nom: newChannel.nom,
        serverId: newChannel.serverId,
      },
    });
  }
}
