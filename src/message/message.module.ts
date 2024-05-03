import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { UsersModule } from 'src/users/users.module';
import { ServerModule } from 'src/server/server.module';

@Module({
  imports: [PrismaModule, AuthModule, ChannelModule, UsersModule, ServerModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
