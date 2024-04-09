import { Controller, Request, Post, UseGuards, Body, HttpCode, HttpStatus, Get, Headers, NotAcceptableException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from '@prisma/client';
import { Public } from 'src/app.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() body, @Res() res) {
        const accessToken = (await this.authService.login(body.email,body.password)).access_token;
        const refreshToken = (await this.authService.refreshToken(body)).refresh_token;

        const response = {
            accessToken,
            refreshToken
        };

        return res.send(response);
    }

    @Post('refresh')
    async refreshToken(@Request() req, @Body() body, @Res() res) {
        const oldRefreshToken = req.cookies['refreshToken'];
        const email = this.authService.verifyRefreshToken(oldRefreshToken);
        const accessToken = (await this.authService.login(body.email,body.password)).access_token;
        const refreshToken = (await this.authService.refreshToken({ email })).refresh_token;
        
        const response = {
            accessToken,
            refreshToken
        };

        return res.send(response);
    }

    @Get('@me')
    async getProfile(@Headers('authorization') authorization: string): Promise<Omit<User, 'password'>> {
        if (!authorization) {
            throw new NotAcceptableException('could not find the jwt token');
        }

        // Extrait le token du body "authorization" (format: "Bearer <token>")
        const token = authorization.split(' ')[1];
        
        // Vérifie le token et récupère les informations de l'utilisateur
        const userProfile = await this.authService.infoUser(token);
        // Utilisez les informations de l'utilisateur comme nécessaire
        const { password, ...userProfileWithoutPassword } = userProfile.user;
        return userProfileWithoutPassword;
    }
}