import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Channel, Message, Server, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerService } from 'src/server/server.service';
import {
  CreateChannelDto,
  CreateChannelResponse,
} from './dto/createChannelDto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serverService: ServerService,
  ) {}
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

  findMessagesByChannelId(id: any): Promise<Message[]> {
    return this.prisma.channel.findUnique({ where: { id } }).messages();
  }

  // TODO: Implement this method
  // findChannelsByServerId(id: any): Promise<Channel[]> {
  //   throw new Error('Method not implemented.');
  // }

  async findOne(id: number): Promise<Channel> {
    return this.prisma.channel.findUnique({
      where: {
        id: Number(id),
      },
    });
  }

  findServerByChannelId(id: any): Promise<Server> {
    return this.prisma.channel.findUnique({ where: { id } }).server();
  }

  async createChannel(
    newChannel: CreateChannelDto,
    user: User,
  ): Promise<CreateChannelResponse> {
    // Check if the server exists
    const server = await this.prisma.server.findUnique({
      where: { id: newChannel.serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if the user is in the server or owns the server
    const userInServer = await this.serverService.isInServer(user, server.nom);

    if (!userInServer && server.ownerId !== user.id) {
      throw new NotFoundException('User not in the server');
    }

    // Check if the channel already exists in the server
    const existingChannel = await this.prisma.channel.findFirst({
      where: { nom: newChannel.nom, serverId: newChannel.serverId },
    });

    if (existingChannel) {
      throw new ConflictException('Channel already exists in the server');
    }

    // Check if user is an admin
    if (
      !(await this.serverService.isOwner(user, server.nom)) &&
      !(await this.serverService.isSuperUser(user, server.nom))
    ) {
      throw new UnauthorizedException('User not an admin');
    }

    // Create the channel
    const channel = await this.prisma.channel.create({
      data: {
        nom: newChannel.nom,
        serverId: newChannel.serverId,
      },
    });

    return {
      id: channel.id,
      name: channel.nom,
      server_id: channel.serverId,
      type: 'TEXT',
    };
  }
}
