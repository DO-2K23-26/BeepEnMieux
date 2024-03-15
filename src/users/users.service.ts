import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Groupe, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  
  constructor(private readonly prisma: PrismaService) {}

  removeSocketId(id: string) {
    this.prisma.user.update({
      where: { socketId: id },
      data: {
        socketId: null,
      },
    });
  }
  
  addSocketId(user: User, id: string) {
    this.prisma.user.update({
      where: { id: user.id },
      data: {
        socketId: id,
      },
    });
  }


  async findOneById(id: number): Promise<{message: string, user: User | null}> {
    const my_user = await this.prisma.user.findUnique({where: { id }});
    if (my_user) {
      return {
        message: "User id: " + id + " found",
        user: my_user};
    } else {
      return null;
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

  async addUserToGroupe(groupeName: string, user: User): Promise<void> {
    this.prisma.groupe.update({
      where: { nom: groupeName },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });
  }

  async findGroupesByUserSocketId(socketId: string): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({
      where: {
        users: {
          some: {
            socketId,
          },
        },
      },
    });
  }

  async removeUserFromAllGroupes(socketId: string): Promise<void> {
    const groupes = await this.findGroupesByUserSocketId(socketId);
    for (const groupe of groupes) {
      this.prisma.groupe.update({
        where: { nom: groupe.nom },
        data: {
          users: {
            disconnect: { socketId: socketId },
          },
        },
      });
    }
  }

  async removeUserFromGroupe(socketId: string, groupe: string): Promise<void> {
    this.prisma.groupe.update({
      where: { nom: groupe },
      data: {
        users: {
          disconnect: { socketId },
        },
      },
    });
  }

  async create(createUserDto: Prisma.UserCreateInput): Promise<Omit<User, 'password'> | null>{
    const { email, password } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpException("User with email: " + email + " already exists", HttpStatus.NOT_FOUND);
    }
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
