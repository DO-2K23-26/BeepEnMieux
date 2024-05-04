import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../shared/interfaces/chat.interface';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  /*
  TODO : Implement the following methods
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
  }*/

  async handleConnection(socket: Socket): Promise<void> {
    this.chatService.handleConnection(socket);
  }

  async handleDisconnect(/*socket: Socket*/): Promise<void> {
    //TODO : Implement the handleDisconnect method
    //this.chatService.handleDisconnect(socket);
  }
}
