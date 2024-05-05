import { Injectable } from '@nestjs/common';
import { Channel, Server, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
