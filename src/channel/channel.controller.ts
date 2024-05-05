import { Body, Controller, Post, Req, Get, Patch, Param } from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  CreateChannelDto,
  CreateChannelResponse,
} from './dto/createChannelDto';
import { Channel, Message } from '@prisma/client';
import internal from 'stream';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Channel> {
    return this.channelService.findOne(id);
  }

  @Get(':id/messages')
  async findMessagesByChannelId(@Param('id') id: number): Promise<Message[]> {
    return this.channelService.findMessagesByChannelId(id);
  }

  @Patch(':id')
  async updateChannel(
    @Body() newChannel: CreateChannelDto,
    @Param('id') id: number,
  ): Promise<Channel> {
    return this.channelService.updateChannel(id, newChannel);
  }

  @Post('')
  async createChannel(
    @Body() newChannel: CreateChannelDto,
    @Req() request: Request,
  ): Promise<CreateChannelResponse> {
    return this.channelService.createChannel(newChannel, request['user']);
  }
}
