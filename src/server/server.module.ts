import { Module } from '@nestjs/common';
import { ServerService } from './server.service';

@Module({
  providers: [ServerService]
})
export class ServerModule {}
