import { Message } from '@prisma/client';

export class CreateGroupeDto {
  id: string;
  userIds: string[];
  users: never;
  nom: string;
  messages?: Message[];
}
