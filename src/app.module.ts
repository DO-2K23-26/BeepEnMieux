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
import { ServerController } from './server/server.controller';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
    UsersModule,
    GroupeModule,
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
  ],
  providers: [PrismaService],
  controllers: [AppController, ServerController],
  exports: [PrismaService],
})
export class AppModule {}
