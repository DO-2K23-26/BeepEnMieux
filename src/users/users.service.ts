import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.model';
import { Room } from '../shared/interfaces/chat.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  private rooms: Room[] = [];
  
  constructor(private readonly prisma: PrismaService) {}

  async addRoom(roomName: string, host: User): Promise<void> {
    const room = await this.getRoomByName(roomName);
    if (room === -1) {
      this.rooms.push({ name: roomName, host, users: [host] });
    }
  }

  async removeRoom(roomName: string): Promise<void> {
    const findRoom = await this.getRoomByName(roomName);
    if (findRoom !== -1) {
      this.rooms = this.rooms.filter((room) => room.name !== roomName);
    }
  }

  async getRoomHost(hostName: string): Promise<User> {
    const roomIndex = await this.getRoomByName(hostName);
    return this.rooms[roomIndex].host;
  }

  async getRoomByName(roomName: string): Promise<number> {
    const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
    return roomIndex;
  }

  async addUserToRoom(roomName: string, user: User): Promise<void> {
    const roomIndex = await this.getRoomByName(roomName);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].users.push(user);
      const host = await this.getRoomHost(roomName);
      if (host.id === user.id) {
        this.rooms[roomIndex].host.socketId = user.socketId;
      }
    } else {
      await this.addRoom(roomName, user);
    }
  }

  async findRoomsByUserSocketId(socketId: string): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.users.find((user) => user.socketId === socketId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.findRoomsByUserSocketId(socketId);
    for (const room of rooms) {
      await this.removeUserFromRoom(socketId, room.name);
    }
  }

  async removeUserFromRoom(socketId: string, roomName: string): Promise<void> {
    const room = await this.getRoomByName(roomName);
    this.rooms[room].users = this.rooms[room].users.filter(
      (user) => user.socketId !== socketId,
    );
    if (this.rooms[room].users.length === 0) {
      await this.removeRoom(roomName);
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { id, email, mdp, pseudo, nom, prenom, createdAt } = createUserDto;
    return this.prisma.user.create({
      data: { id, email, mdp, pseudo, nom, prenom, createdAt },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.prisma.user.update({
      where: { id: id.toString() },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }
}
