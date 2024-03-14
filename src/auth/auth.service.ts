import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = (await this.usersService.findOneByEmail(email));
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
  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async verifyRefreshToken(jwtToken: string) {
      const decodedToken = this.jwtService.decode(jwtToken);
      return decodedToken.email;
  }

  async refreshToken(user: any) {
    const tokenId = uuid();
    const payload = { email: user.email, sub: user._id, tokenId: tokenId};
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }

  async infoUser(jwtToken: string): Promise<any> {
    const decodedToken = this.jwtService.decode(jwtToken);
    console.log(decodedToken, jwtToken);
    const my_mail = await this.usersService.findOneByEmail(decodedToken.email);
    if (my_mail) {
      return {
        message: "User found",
        user: my_mail};
    } else {
      throw new NotAcceptableException('could not find the user');
    }
  }
}
