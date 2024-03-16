import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { GroupeModule } from 'src/groupe/groupe.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, GroupeModule, UsersModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
