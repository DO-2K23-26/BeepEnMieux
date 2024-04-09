import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  HttpException,
  Req,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { GroupeService } from 'src/groupe/groupe.service';

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

    if (!this.userService.isInGroupe(user, groupe)) {
      throw new HttpException('Unauthorized', 401);
    }

    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    return message;
  }

  @Get('groupe/:id')
  async findAllByGroup(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new HttpException('Unauthorized', 401);
    }
    const token = authorization.split(' ')[1];
    const userProfile = await this.authService.infoUser(token);
    const groupe = await this.groupeService.findByName(id);
    if (
      (await this.userService.isInGroupe(userProfile.user, groupe)) === false
    ) {
      throw new HttpException('Unauthorized', 401);
    }
    return this.messageService.findAllByGroup(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto) {
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
  remove(@Param('id') id: number) {
    return this.messageService.remove(id);
  }
}
