import { Body, Controller, Post, Req, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  CreateChannelDto,
  CreateChannelResponse,
} from './dto/createChannelDto';
import { Channel, Message } from '@prisma/client';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get(':id')
  async findOne(@Req() request: Request): Promise<Channel> {
    return this.channelService.findOne(request['channel'].id);
  }

  @Get(':id/messages')
  async findMessagesByChannelId(@Req() request: Request): Promise<Message[]> {
    return this.channelService.findMessagesByChannelId(request['channel'].id);
  }

  @Post('')
  async createChannel(
    @Body() newChannel: CreateChannelDto,
    @Req() request: Request,
  ): Promise<CreateChannelResponse> {
    return this.channelService.createChannel(newChannel, request['user']);
  }
}
