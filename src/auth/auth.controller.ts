import { Controller, Request, Post, UseGuards, Body, Get, Headers, NotAcceptableException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body, @Res() res) {
        const accessToken = await this.authService.login(body.email,body.password);
        const refreshToken = await this.authService.refreshToken(body);

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
        const accessToken = await this.authService.login(body.email,body.password);
        const refreshToken = await this.authService.refreshToken({ email });
        
        const response = {
            accessToken,
            refreshToken
        };

        return res.send(response);
    }

    @UseGuards(AuthGuard('local'))
    @Get('@me')
    async getProfile(@Headers('authorization') authorization: string): Promise<any> {
        if (!authorization) {
            throw new NotAcceptableException('could not find the jwt token');
        }

        // Extrait le token du body "authorization" (format: "Bearer <token>")
        const token = authorization.split(' ')[1];
        console.log(token);
        console.log(authorization);
        
        // Vérifie le token et récupère les informations de l'utilisateur
        const userProfile = await this.authService.infoUser(token);

        // Utilisez les informations de l'utilisateur comme nécessaire
        return userProfile;
    }
}