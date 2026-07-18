import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'OK',
      service: 'AyuNet Core API',
      timestamp: new Date().toISOString(),
    };
  }
}
