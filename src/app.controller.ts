import { Controller, Get } from '@nestjs/common';
import { Public } from './app.service';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello(): { message: string } {
    return { message: 'up' };
  }
}
