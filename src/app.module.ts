import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ServerModule } from './server/server.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    MessageModule,
    AuthModule,
    ChatModule,
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            // singleLine: true,
          },
        },
      },
    }),
    ServerModule,
    ChannelModule,
  ],
  providers: [PrismaService],
  controllers: [AppController],
  exports: [PrismaService],
})
export class AppModule {}
