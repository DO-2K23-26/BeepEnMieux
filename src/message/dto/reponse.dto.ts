export interface MessageEntity {
  id: number;
  ownerId: number;
  content: string;
  channelId: number;
  timestamp: Date;
}
