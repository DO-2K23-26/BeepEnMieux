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
import { GroupeService } from 'src/groupe/groupe.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';
import { User } from '@prisma/client';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly groupeService: GroupeService,
  ) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Req() request: Request) {
    // check if user is in groupe
    const user = request['user'];
    const message = await this.messageService.findOne(id);
    const groupe = await this.groupeService.findGroupesById(message.groupeId);

    if ((await this.userService.isInGroupe(user, groupe)) === false) {
      throw new HttpException('Unauthorized', 401);
    }

    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    return message;
  }

  @Get('groupe/:id')
  async findAllByGroup(@Param('id') id: string, @Req() request: Request) {
    const userProfile = request['user'];
    const groupe = await this.groupeService.findByName(id);
    if ((await this.userService.isInGroupe(userProfile, groupe)) === false) {
      throw new HttpException('Unauthorized', 401);
    }
    return this.messageService.findAllByGroup(id);
  }

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
      groupe: {
        connect: { id: updateMessageDto.groupe.id },
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
}
