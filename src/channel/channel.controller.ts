import { Controller, Get, Req } from '@nestjs/common';
import { Channel, Message } from '@prisma/client';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  async findChannelsByServerId(@Req() request: Request): Promise<Channel[]> {
    return this.channelService.findChannelsByServerId(request['server'].id);
  }

  @Get(':id')
  async findOne(@Req() request: Request): Promise<Channel> {
    return this.channelService.findOne(request['channel'].id);
  }

  @Get(':id/messages')
  async findMessagesByChannelId(@Req() request: Request): Promise<Message[]> {
    return this.channelService.findMessagesByChannelId(request['channel'].id);
  }
}
