import {
  Controller,
  Request,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  NotAcceptableException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { Public } from 'src/app.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body, @Res() res) {
    const accessToken = (
      await this.authService.login(body.email, body.password)
    ).access_token;
    const refreshToken = (await this.authService.refreshToken(body))
      .refresh_token;
    const response = {
      accessToken,
      refreshToken,
    };

    return res.send(response);
  }

  @Public()
  @Post('refresh')
  async refreshToken(
    @Request() req,
    @Body() body,
    @Res() res,
    @Body('refreshToken') oldRefreshToken: string,
  ) {
    const decodedToken = this.jwtService.decode(oldRefreshToken);
    if (!decodedToken) return null;
    const user = await this.userService.findOneByEmail(decodedToken.email);
    const accessToken = (await this.authService.accessToken(user)).access_token;
    const refreshToken = (await this.authService.refreshToken(user))
      .refresh_token;

    const response = {
      accessToken,
      refreshToken,
    };

    return res.send(response);
  }

  @Get('@me')
  async getProfile(
    @Headers('authorization') authorization: string,
  ): Promise<Omit<User, 'password'>> {
    if (!authorization) {
      throw new NotAcceptableException('could not find the jwt token');
    }

    // Extrait le token du body "authorization" (format: "Bearer <token>")
    const token = authorization.split(' ')[1];

    // Vérifie le token et récupère les informations de l'utilisateur
    const userProfile = await this.authService.infoUser(token);

    // Supprime le mot de passe de l'objet utilisateur
    userProfile.user.password = undefined;
    return userProfile.user;
  }
}
