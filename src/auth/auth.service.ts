import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }
    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new NotAcceptableException('Invalid email or password');
    }
    return this.accessToken(user);
  }

  async accessToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      sub: user._id,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '5m' }),
    };
  }

  async verifyRefreshToken(jwtToken: string) {
    const decodedToken = this.jwtService.decode(jwtToken);
    if (!decodedToken) {
      throw new NotAcceptableException('Invalid token');
    }
    return decodedToken.email;
  }

  async refreshToken(user: any) {
    const tokenId = uuid();
    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      sub: user._id,
      tokenId: tokenId,
    };
    return {
      refresh_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
  }

  async infoUser(
    jwtToken: string,
  ): Promise<{ message: string; user: User } | null> {
    const decodedToken = this.jwtService.decode(jwtToken);
    if (!decodedToken) return null;
    const my_mail = await this.usersService.findOneByEmail(decodedToken.email);
    if (my_mail) {
      return {
        message: 'User found',
        user: my_mail,
      };
    }
    return null;
  }
}
