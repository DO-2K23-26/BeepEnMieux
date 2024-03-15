import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { GroupeModule } from 'src/groupe/groupe.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, GroupeModule, AuthModule],
  providers: [ChatGateway],
})
export class ChatModule {}
