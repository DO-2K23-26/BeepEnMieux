import { Body, Controller, Post, Req } from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  CreateChannelDto,
  CreateChannelResponse,
} from './dto/createChannelDto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /*
  TODO: Implement the following methods (same time as in channel.service.ts)
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
  }*/

  @Post('')
  async createChannel(
    @Body() newChannel: CreateChannelDto,
    @Req() request: Request,
  ): Promise<CreateChannelResponse> {
    return this.channelService.createChannel(newChannel, request['user']);
  }
}
