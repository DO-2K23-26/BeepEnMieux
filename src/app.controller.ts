import { Controller, Get } from '@nestjs/common';
import { AppService, Public } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): { message: string; version: string } {
    return this.appService.getStatus();
  }
}
