import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { ServerController } from './server.controller';

@Module({
  imports: [ PrismaModule, UsersModule ],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService]
})
export class ServerModule {}
