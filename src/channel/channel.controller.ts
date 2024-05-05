import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  CreateChannelDto,
  CreateChannelResponse,
} from './dto/createChannelDto';
import { Channel, Message, User } from '@prisma/client';

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
    const userProfile: User = request['user'];
    return this.channelService.createChannel(newChannel, userProfile);
  }

  @Delete(':id')
  async deleteChannel(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<Channel> {
    const userProfile: User = request['user'];
    return this.channelService.deleteChannel(id, userProfile);
  }
}
