import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async checkHealth() {
    const appName = this.configService.get<string>('app.name', 'AyuNet Core Backend');
    const environment = this.configService.get<string>('app.env', 'development');

    // 1. Check Database connection state
    let databaseStatus = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      this.logger.error('Health Check - Database error:', error);
      databaseStatus = 'down';
    }

    // 2. Check Redis connection state (if configured)
    const isRedisConfigured = this.configService.get<boolean>('redis.isConfigured', false);
    let redisStatus: 'up' | 'down' | 'not_configured' = 'not_configured';

    if (isRedisConfigured) {
      const host = this.configService.get<string>('redis.host');
      const port = this.configService.get<number>('redis.port', 6379);
      const password = this.configService.get<string>('redis.password');

      let redisClient: Redis | null = null;
      try {
        redisClient = new Redis({
          host,
          port,
          password,
          connectTimeout: 2000,
          maxRetriesPerRequest: 0,
        });

        const ping = await redisClient.ping();
        if (ping === 'PONG') {
          redisStatus = 'up';
        } else {
          redisStatus = 'down';
        }
      } catch (error) {
        this.logger.error('Health Check - Redis connection error:', error);
        redisStatus = 'down';
      } finally {
        if (redisClient) {
          try {
            redisClient.disconnect();
          } catch (disconnectError) {
            this.logger.warn('Error disconnecting temporary Redis health client', disconnectError);
          }
        }
      }
    }

    const overallStatus =
      databaseStatus === 'up' && (redisStatus === 'up' || redisStatus === 'not_configured')
        ? 'up'
        : 'down';

    return {
      status: overallStatus,
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      details: {
        appName,
        environment,
        database: databaseStatus,
        redis: redisStatus,
      },
    };
  }
}
