import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChannelService } from 'src/channel/channel.service';
import { UsersService } from 'src/users/users.service';
import { ServerService } from 'src/server/server.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';
import { User } from '@prisma/client';
import { MessageEntity } from './dto/reponse.dto';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly channelService: ChannelService,
    private readonly serverService: ServerService,
  ) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  /* TODO AFTER FIXING MESSAGE FINDONE
  @Get(':id')
  async findOne(@Param('id') id: number, @Req() request: Request) {
    // check if user is in server
    const user = request['user'];
    const message = await this.messageService.findOne(id);
    const channel = await this.channelService.findOne(message.channelId);
    const server = await this.channelService.findServerByChannelId(channel.id);

    if ((await this.userService.isInServer(user, server)) === false) {
      throw new HttpException('Unauthorized', 401);
    }

    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    return message;
  }*/

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() request: Request,
  ) {
    const user: User = request['user'];
    const message = await this.messageService.findOne(id);

    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    if (user.id !== message.authorId) {
      throw new HttpException('Unauthorized', 401);
    }

    const messageUpdateInput = {
      ...updateMessageDto,
      author: {
        connect: { id: updateMessageDto.author.id },
      },
      channel: {
        connect: { id: updateMessageDto.channel.id },
      },
    };
    return this.messageService.update(id, messageUpdateInput);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const user: User = request['user'];
    const message = await this.messageService.findOne(id);

    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    if (user.id !== message.authorId) {
      throw new HttpException('Unauthorized', 401);
    }

    return this.messageService.remove(id);
  }

  @Get(':serverId/:channelId')
  async findAllByChannel(
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: number,
    @Req() request: Request,
  ): Promise<MessageEntity[]> {
    return this.messageService.findMessagesByChannelId(
      channelId,
      serverId,
      request['user'],
    );
  }
}
