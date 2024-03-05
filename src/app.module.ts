import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
