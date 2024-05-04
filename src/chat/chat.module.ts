import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChannelModule } from 'src/channel/channel.module';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';
import { ChatService } from './chat.service';

@Module({
  imports: [UsersModule, ChannelModule, AuthModule, MessageModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
