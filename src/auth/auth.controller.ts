import { Controller, Request, Post, UseGuards, Body, Get, Headers, NotAcceptableException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('auth/login')
    async login(@Request() req) {
        return this.authService.login(req.body);
    }

    @UseGuards(AuthGuard('local'))
    @Get('auth/@me')
    async getProfile(@Headers('authorization') authorization: string): Promise<any> {
        if (!authorization) {
            throw new NotAcceptableException('could not find the jwt token');
        }

        // Extrait le token du body "authorization" (format: "Bearer <token>")
        const token = authorization.split(' ')[1];

        // Vérifie le token et récupère les informations de l'utilisateur
        const userProfile = await this.authService.infoUser(token);

        // Utilisez les informations de l'utilisateur comme nécessaire
        return userProfile;
    }
}