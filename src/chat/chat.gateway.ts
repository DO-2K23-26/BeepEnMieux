import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../shared/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { Message } from '@prisma/client';
import { ChannelService } from 'src/channel/channel.service';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UsersService,
    private channelService: ChannelService,
    private authService: AuthService,
    private messageService: MessageService,
  ) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('chat')
  async handleChatEvent(
    @MessageBody() data: Promise<{ contenu: string; timestamp: number }>,
    @ConnectedSocket() client: Socket,
  ): Promise<Message> {
    const token = client.handshake.auth.token;
    const author = (await this.authService.infoUser(token))?.user;
    if (!author) {
      this.logger.log(`Invalid author`);
      throw new WsException('Invalid author');
    }
    const channelName = Array.from(client.rooms)[1];
    if (!channelName) {
      this.logger.log(`Client is not in a room`);
      throw new WsException('Client is not in a room');
    }
    const isTimedOut = await this.channelService.isTimeOut(author, channelName);
    if (isTimedOut) {
      this.logger.log(`User is timed out`);
      throw new WsException('User is timed out');
    }

    const channel = await this.channelService.findByName(channelName);

    const retour = {
      contenu: (await data).contenu,
      timestamp: (await data).timestamp,
      author: author.username,
      id: null,
    };
    const message: any = {
      contenu: (await data).contenu,
      author: author,
      channel: channel,

      timestamp: (await data).timestamp,
    };
    const messageStocked = await this.messageService.create(message);
    retour.id = messageStocked.id;
    this.server.to(channel.nom).emit('chat', retour); // broadcast messages
    this.logger.log(`Message sent to ${channel.nom}`);
    return message;
  }

  @SubscribeMessage('edit')
  async handleEditEvent(
    @MessageBody()
    data: Promise<{ contenu: string; timestamp: number; id: number }>,
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const author = (await this.authService.infoUser(token))?.user;
    if (!author) {
      this.logger.log(`Invalid author`);
      throw new WsException('Invalid author');
    }
    const channelName = Array.from(client.rooms)[1];
    if (!channelName) {
      this.logger.log(`Client is not in a room`);
      throw new WsException('Client is not in a room');
    }
    const userId = (await this.messageService.findOne((await data).id))
      .authorId;
    if (userId !== author.id) {
      this.logger.log(`User is not the author`);
      throw new WsException('User is not the author');
    }
    const retour = {
      id: (await data).id,
      contenu: (await data).contenu,
    };
    const channel = await this.channelService.findByName(channelName);
    this.messageService.updateContenu((await data).id, (await data).contenu);
    this.server.to(channel.nom).emit('edit', retour); // broadcast messages
  }

  @SubscribeMessage('delete')
  async handleDeleteEvent(
    @MessageBody() data: Promise<{ id: number }>,
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const author = (await this.authService.infoUser(token))?.user;
    if (!author) {
      this.logger.log(`Invalid author`);
      throw new WsException('Invalid author');
    }
    const channelName = Array.from(client.rooms)[1];
    if (!channelName) {
      this.logger.log(`Client is not in a room`);
      throw new WsException('Client is not in a room');
    }
    const userId = (await this.messageService.findOne((await data).id))
      .authorId;
    if (userId !== author.id) {
      this.logger.log(`User is not the author`);
      throw new WsException('User is not the author');
    }
    const channel = await this.channelService.findByName(channelName);
    this.messageService.remove((await data).id);
    this.server.to(channel.nom).emit('delete', (await data).id); // broadcast messages
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(client: Socket, data: string) {
    console.log('join_room');
    //leave all rooms
    const channels = await this.userService.findServersByUserSocketId(client.id);
    const channelsNames = channels.map((channel) => channel.nom);
    for (const channel of channelsNames) {
      client.leave(channel);
    }

    //verify user and channel
    const token = client.handshake.auth.token;
    const user = (await this.authService.infoUser(token))?.user;
    const channel = await this.channelService.findByName(data);
    const channelName = channel.nom;
    //exception if user or channel is invalid
    if (!user || !channel) {
      throw new WsException('Invalid user or channel');
    }

    if (!channelsNames.includes(channelName)) {
      throw new WsException('User not in channel');
    }

    //join room
    if (user.socketId) {
      this.logger.log(`${user.socketId} is joining ${channel.nom}`);
      client.join(channel.nom);
    }
  }

  async handleConnection(socket: Socket): Promise<void> {
    const token = socket.handshake.auth.token;
    const user = (await this.authService.infoUser(token))?.user;
    if (!user) {
      this.logger.log(`Invalid token: ${token}`);
      socket.disconnect();
      return;
    }
    await this.userService.addSocketId(user, socket.id);
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.userService.removeSocketId(socket.id);
    const channels = await this.userService.findServersByUserSocketId(socket.id);
    for (const channel of channels) {
      socket.leave(channel.nom);
    }
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
