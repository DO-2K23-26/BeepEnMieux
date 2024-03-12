import { Message, User } from '@prisma/client';

export class CreateGroupeDto {
  id: string;
  userIds: string[];
  users: User[];
  nom: string;
  messageIds?: string[];
  messages?: Message[];
}
