import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChatService {
  constructor(private readonly authService: AuthService) {}

  async handleConnection(socket: Socket) {
    const payload = await this.authService.infoUser(
      socket.handshake.auth.token,
    );
    if (!payload) {
      socket.disconnect();
    }
  }
  /*
  TODO: Implement the following methods
  
  handleDisconnect(socket: Socket) {
    throw new Error('Method not implemented.');
  }

  handleJoinRoom(client: Socket, data: string) {
    throw new Error('Method not implemented.');
  }
  handleDeleteEvent(data: { id: number }, socket: Socket) {
    throw new Error('Method not implemented.');
  }
  handleChatEvent(
    data: Promise<{ contenu: string; timestamp: number }>,
    socket: Socket,
  ) {
    throw new Error('Method not implemented.');
  } */
}
