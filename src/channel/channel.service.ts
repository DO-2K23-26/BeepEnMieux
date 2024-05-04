import { Injectable } from '@nestjs/common';
import { Channel, Server, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChannelService {
  async isTimeOut(author: User, channelName: string) {
    const channel = await this.findByName(channelName);
    return this.prisma.timedOut.findFirst({
      where: {
        userId: author.id,
        channelId: channel.id,
      },
    });
  }
  findByName(channelName: string): Promise<Channel> {
    return this.prisma.channel.findUnique({ where: { nom: channelName } });
  }
  constructor(private readonly prisma: PrismaService) {}
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
