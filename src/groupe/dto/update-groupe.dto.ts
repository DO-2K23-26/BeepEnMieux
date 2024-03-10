import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupeDto } from './create-groupe.dto';
import { Message, User } from '@prisma/client';

export class UpdateGroupeDto extends PartialType(CreateGroupeDto) {
  userIds?: string[];
  users?: User[];
  nom?: string;
  messages?: Message[];
}
