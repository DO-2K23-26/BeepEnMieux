import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from '../shared/interfaces/chat.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private rooms: Room[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: number): Promise<{message: string, user: User}>{
    const my_user = await this.prisma.user.findUnique({where: { id }});
    if (my_user) {
      return {
        message: "User id: " + id + " found",
        user: my_user};
    } else {
      throw new HttpException("User id: " + id + " not found", HttpStatus.NOT_FOUND);
    }
     
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException("User with email: " + email + " not found", HttpStatus.NOT_FOUND);
    }
    return user;
  }

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

  async create(createUserDto: Prisma.UserCreateInput): Promise<User> {
    const { email, password } = createUserDto;
    return this.prisma.user.create({
      data: { email, password },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      user.password = undefined;
    } 
    return users;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException("User id: " + id + " not found", HttpStatus.NOT_FOUND);
    }
    
    // Exclure la propriété password de l'objet updateUserDto
    const { password, ...data } = updateUserDto;
  
    // Mettre à jour l'utilisateur avec les données excluant le mot de passe
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
  
    // Supprimer le mot de passe du résultat retourné
    updatedUser.password = undefined;
    return updatedUser;
  }
  
  

  async remove(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException("User id: " + id + " not found", HttpStatus.NOT_FOUND);
    }
    const deleteUser = await this.prisma.user.delete({
      where: { id },
    });
    deleteUser.password = undefined;
    return deleteUser;
  }
}
