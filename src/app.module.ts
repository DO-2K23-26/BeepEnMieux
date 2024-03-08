import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { MessageModule } from './message/message.module';
import { GroupeModule } from './groupe/groupe.module';
import { UsersController } from './users/users.controller';
import { MessageController } from './message/message.controller';
import { GroupeController } from './groupe/groupe.controller';
import { UsersService } from './users/users.service';
import { MessageService } from './message/message.service';
import { GroupeService } from './groupe/groupe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
    GroupeModule,
    MessageModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [
    AppController,
    UsersController,
    MessageController,
    GroupeController,
  ],
  providers: [
    AppService,
    PrismaService,
    UsersService,
    MessageService,
    GroupeService,
  ],
  exports: [PrismaService],
})
export class AppModule {}
