import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../shared/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { Message } from '@prisma/client';
import { GroupeService } from 'src/groupe/groupe.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private userService: UsersService, private groupeService: GroupeService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('chat')
  async handleChatEvent(
    @MessageBody()
    payload: Message,
  ): Promise<Message> {
    const groupe = this.groupeService.findOne(payload.groupeId);
    this.server.to((await groupe).nom).emit('chat', payload); // broadcast messages
    this.logger.log(`Message sent to ${(await groupe).nom}`);
    return payload;
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(
    @MessageBody()
    payload: Message,
  ) {
    const author = (await this.userService.findOneById(payload.authorId)).user;
    const groupe = (await this.groupeService.findOne(payload.groupeId));
    if (author.socketId) {
      this.logger.log(
        `${author.socketId} is joining ${groupe.nom}`,
      );
      this.server.in(author.socketId).socketsJoin(groupe.nom);
      this.userService.addUserToGroupe(groupe.nom, author);
    }
  }

  async handleConnection(socket: Socket, ...args: any[]): Promise<void> {
    this.userService.addSocketId(args[0], socket.id);
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
