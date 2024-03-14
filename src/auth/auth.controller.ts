import { Controller, Request, Post, UseGuards, Body, Get, Headers, NotAcceptableException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Request() req, @Res() res) {
        const accessToken = await this.authService.login(req.body);
        const refreshToken = await this.authService.refreshToken(req.body);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        return accessToken
    }

    @Post('refresh')
    async refreshToken(@Request() req, @Body() body, @Res() res) {
        const oldRefreshToken = req.cookies['refreshToken'];
        const email = this.authService.verifyRefreshToken(oldRefreshToken);
        const accessToken = await this.authService.login({ email });
        const refreshToken = await this.authService.refreshToken({ email });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        return accessToken
    }

    @UseGuards(AuthGuard('local'))
    @Get('@me')
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