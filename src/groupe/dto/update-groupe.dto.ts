import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupeDto } from './create-groupe.dto';
import { Message } from '@prisma/client';

export class UpdateGroupeDto extends PartialType(CreateGroupeDto) {
  userIds?: string[];
  users?: never;
  nom?: string;
  messages?: Message[];
}
