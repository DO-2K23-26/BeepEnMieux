import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { GroupeModule } from 'src/groupe/groupe.module';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [UsersModule, GroupeModule, AuthModule, MessageModule],
  providers: [ChatGateway],
})
export class ChatModule {}
