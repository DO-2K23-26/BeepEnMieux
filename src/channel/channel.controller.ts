import { Controller } from '@nestjs/common';
import { ChannelService } from './channel.service';

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
}
