import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GroupeModule } from './groupe/groupe.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    UsersModule,
    GroupeModule,
    MessageModule,
    AuthModule,
    ChatModule,
    PrismaModule,
    LoggerModule.forRoot(),
  ],
  providers: [PrismaService],
  controllers: [AppController],
  exports: [PrismaService],
})
export class AppModule {}
