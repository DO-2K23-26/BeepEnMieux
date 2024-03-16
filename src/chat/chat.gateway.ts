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
import { GroupeService } from 'src/groupe/groupe.service';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private userService: UsersService, 
    private groupeService: GroupeService, 
    private authService: AuthService,
    private messageService: MessageService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('chat')
  async handleChatEvent(
    @MessageBody() data: Promise<{contenu: string, timestamp: number}>,
    @ConnectedSocket() client: Socket,
  ): Promise<Message> {
    const token = client.handshake.auth.token;
    const author = (await this.authService.infoUser(token))?.user;
    let iterateur = client.rooms.keys();
    iterateur.next();
    const groupeName = iterateur.next().value;
    const groupe = await this.groupeService.findByName(groupeName);
    if(!groupe || !author) {
      this.logger.log(`Invalid groupe or author`);
      throw new WsException('Invalid groupe or author');
    }
    const retour = {
      contenu: (await data).contenu,
      timestamp: (await data).timestamp,
      author: author.nickname,
    }
    this.server.to(groupe.nom).emit('chat', retour); // broadcast messages
    const message: any = {
      contenu: (await data).contenu,
      author: author,
      groupe: groupe,
      timestamp: (await data).timestamp,
    };
    this.messageService.create(message);
    this.logger.log(`Message sent to ${groupe.nom}`);
    return message;
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(
    client: Socket, data: string
    ) {
    console.log('join_room');
    //leave all rooms except current room
    const groupes = await this.userService.findGroupesByUserSocketId(client.id);
    for (const groupe of groupes) {
      client.leave(groupe.nom);
    }

    //verify user and groupe
    const token = client.handshake.auth.token;
    const user = (await this.authService.infoUser(token))?.user;
    const groupe = await this.groupeService.findByName(data);
    //exception if user or groupe is invalid
    if(!user || !groupe) {
      throw new WsException('Invalid user or groupe');
    }

    //join room
    if (user.socketId) {
      this.logger.log(
        `${user.socketId} is joining ${groupe.nom}`,
      );
      this.server.in(user.socketId).socketsJoin(groupe.nom);
      await this.userService.addUserToGroupe(groupe.nom, user);
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
    const groupes = await this.userService.findGroupesByUserSocketId(socket.id);
    for (const groupe of groupes) {
      socket.leave(groupe.nom);
    }
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
