import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ChannelService } from 'src/channel/channel.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './dto/reponse.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UsersService,
    private readonly channelService: ChannelService,
  ) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Req() request: Request) {
    // check if user is in server
    const user: User = request['user'];
    return await this.messageService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() request: Request,
  ) {
    const user: User = request['user'];
    const messageUpdateInput = {
      ...updateMessageDto,
      author: {
        connect: { id: updateMessageDto.author.id },
      },
      channel: {
        connect: { id: updateMessageDto.channel.id },
      },
    };
    return this.messageService.update(id, messageUpdateInput, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const user: User = request['user'];
    return this.messageService.remove(id, user);
  }

  @Get(':serverId/:channelId')
  async findAllByChannel(
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: number,
    @Req() request: Request,
  ): Promise<MessageEntity[]> {
    const user: User = request['user'];
    return this.messageService.findMessagesByChannelId(
      channelId,
      serverId,
      user,
    );
  }
}
