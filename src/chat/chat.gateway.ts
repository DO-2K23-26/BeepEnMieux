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
    throw new Error('Method not implemented.');
  }

  @SubscribeMessage('delete')
  async handleDeleteEvent(
    @MessageBody() data: Promise<{ id: number }>,
    @ConnectedSocket() client: Socket,
  ) {
    throw new Error('Method not implemented.');
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(client: Socket, data: string) {
    throw new Error('Method not implemented.');
  }

  async handleConnection(socket: Socket): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
