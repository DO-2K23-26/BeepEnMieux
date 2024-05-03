import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { Channel } from '@prisma/client';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  contenu?: any;
  channelId?: never;
  channel: Channel;
}
