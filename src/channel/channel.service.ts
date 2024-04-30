import { Injectable } from '@nestjs/common';
import { Channel } from '@prisma/client';

@Injectable()
export class ChannelService {
    findMessagesByChannelId(id: any): { id: number; contenu: string; authorId: number; channelId: number; timestamp: Date; }[] | PromiseLike<{ id: number; contenu: string; authorId: number; channelId: number; timestamp: Date; }[]> {
        throw new Error('Method not implemented.');
    }
    findOne(id: any): { id: number; nom: string; serverId: number; } | PromiseLike<{ id: number; nom: string; serverId: number; }> {
        throw new Error('Method not implemented.');
    }
    findChannelsByServerId(id: any) : Promise<Channel[]>{
        throw new Error('Method not implemented.');
    }
}
