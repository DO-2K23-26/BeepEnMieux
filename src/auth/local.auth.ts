import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Headers, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(@Headers('authorization') authorization: string) {
    const payload = authorization.replace('Bearer ', '');

    const user = await this.authService.infoUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
