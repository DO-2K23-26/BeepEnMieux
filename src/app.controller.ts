import { Controller, Get } from '@nestjs/common';
import { Public } from './app.service';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello(): { message: string; version: string } {
    return { message: 'up', version: '0.1.0' };
  }
}
