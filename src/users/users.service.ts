import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Groupe, Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(author: string) {
    return await this.prisma.user.findFirst({ where: { email: author } });
  }

  async removeSocketId(id: string) {
    await this.prisma.user.updateMany({
      where: { socketId: id },
      data: {
        socketId: null,
      },
    });
  }

  async addSocketId(user: User, id: string) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        socketId: id,
      },
    });
  }

  async findOneById(
    id: number,
  ): Promise<{ message: string; user: User | null }> {
    const my_user = await this.prisma.user.findUnique({ where: { id } });
    if (my_user) {
      return {
        message: 'User id: ' + id + ' found',
        user: my_user,
      };
    } else {
      return null;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async addUserToGroupe(groupeName: string, user: User): Promise<void> {
    await this.prisma.groupe.update({
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

  async findGroupesByUserId(id: number): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({
      where: {
        users: {
          some: {
            id,
          },
        },
      },
    });
  }

  async create(
    email: string,
    nickname: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(
        'User with email: ' + email + ' already exists',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if email, nickname and password are provided
    if (!email || !nickname || !password) {
      throw new HttpException(
        'Email, nickname and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the password
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user: Prisma.UserCreateInput = {
      email,
      nickname,
      password: hashedPassword,
    };

    const result = await this.prisma.user.create({
      data: user,
    });

    // Supprimer le mot de passe du résultat retourné
    result.password = undefined;

    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      user.password = undefined;
    }
    return users;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException(
        'User id: ' + id + ' not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Mettre à jour l'utilisateur avec les données excluant le mot de passe
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Supprimer le mot de passe du résultat retourné
    updatedUser.password = undefined;
    return updatedUser;
  }

  async remove(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException(
        'User id: ' + id + ' not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const deleteUser = await this.prisma.user.delete({
      where: { id },
    });
    deleteUser.password = undefined;
    return deleteUser;
  }

  async isInGroupe(user: User, groupe: Groupe): Promise<boolean> {
    if (!user || !groupe) {
      return false;
    }
    const groupes = await this.prisma.user
      .findUnique({ where: { id: user.id } })
      .groupes();
    return groupes.some((g) => g.id === groupe.id);
  }
}
