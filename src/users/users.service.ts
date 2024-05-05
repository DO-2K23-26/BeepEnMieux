import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User, Server } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByUsername(username: string): Promise<User | null> {
    // Check if user already exists
    if (await this.prisma.user.findFirst({ where: { username } })) {
      return await this.prisma.user.findFirst({ where: { username } });
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async findByEmail(author: string) {
    return await this.prisma.user.findFirst({ where: { email: author } });
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

  async addUserToServer(serverName: string, user: User): Promise<void> {
    await this.prisma.server.update({
      where: { nom: serverName },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });
  }

  async findServersByUserId(id: number): Promise<Server[]> {
    return this.prisma.server.findMany({
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
    username: string,
    password: string,
    lastname: string,
    firstname: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.NOT_FOUND);
    }
    console.log('email', email);
    console.log('username', username);
    console.log('password', password);
    // Check if email, username and password are provided
    if (!email || !username || !password) {
      throw new HttpException(
        'Email, username and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the password
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user: Prisma.UserCreateInput = {
      email,
      username,
      password: hashedPassword,
      firstname: firstname,
      lastname: lastname,
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
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException(
        'User id: ' + id + ' not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Vérifier si l'email est déjà utilisé
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new HttpException(
          'User with email: ' + updateUserDto.email + ' already exists',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // Vérifier si le username est déjà utilisé
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new HttpException(
          'User with username: ' + updateUserDto.username + ' already exists',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // Vérifier si le mot de passe est fourni et le hasher
    if (updateUserDto.password) {
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        updateUserDto.password,
        saltOrRounds,
      );
      updateUserDto.password = hashedPassword;
    }

    // Mettre à jour l'utilisateur avec les données
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Supprimer le mot de passe du résultat retourné
    updatedUser.password = undefined;
    return updatedUser;
  }

  async remove(
    id: number,
    userProfile: User,
  ): Promise<Omit<User, 'password'> | null> {
    if (userProfile.id !== Number(id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
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

  async isInServer(user: User, server: Server): Promise<boolean> {
    if (!user || !server) {
      return false;
    }
    const servers = await this.prisma.user
      .findUnique({ where: { id: user.id } })
      .servers();
    return servers.some((g) => g.id === server.id);
  }
}
