import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { GroupeModule } from 'src/groupe/groupe.module';

@Module({
  imports: [UsersModule, GroupeModule],
  providers: [ChatGateway],
})
export class ChatModule {}
