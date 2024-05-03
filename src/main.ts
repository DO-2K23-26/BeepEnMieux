import { Logger } from 'nestjs-pino';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { env } from 'process';

async function bootstrap() {
  dotenv.config();
  const port = process.env.PORT || 9644;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });
  await app.listen(port, '0.0.0.0');
}
bootstrap();
