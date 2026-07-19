import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { appConfig, dbConfig, redisConfig, throttlerConfig } from './config/app.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, throttlerConfig],
      validate,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttler.ttl', 60) * 1000, // Conversion to milliseconds (standard in Throttler v6)
          limit: config.get<number>('throttler.limit', 10),
        },
      ],
    }),

    // Core Global Modules
    DatabaseModule,
    LoggerModule,
    HealthModule,
  ],
  providers: [
    // Global Rate Limit Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware globally to intercept all routes
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
