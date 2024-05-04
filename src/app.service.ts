import { Injectable, SetMetadata } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { message: string; version: string } {
    const version = process.env.VERSION || 'Dev env';

    return { message: 'up', version: version };
  }
}
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
