import { Channel, User } from '@prisma/client';

export class CreateMessageDto {
  contenu: any; // Adjust the type according to your actual data structure
  channelId: never; // Adjust the type based on the type of your group identifier
  authorId: never; // Adjust the type based on the type of your user identifier
  timestamp: any; // Adjust the type according to your actual data structure
  author: User; // Adjust the type based on the type of your user identifier
  channel: Channel; // Adjust the type based on the type of your group identifier
}
