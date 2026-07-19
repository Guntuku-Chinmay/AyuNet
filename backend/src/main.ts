import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './logger/logger.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is loaded
  });

  // Resolve custom transient/singleton AppLogger
  const appLogger = await app.resolve(AppLogger);
  app.useLogger(appLogger);

  // Security headers using Helmet
  app.use(helmet());

  // CORS Configuration
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Response Compression
  app.use(compression());

  // Set Global Routing Prefix
  app.setGlobalPrefix('api');

  // Enable URI Versioning (e.g., /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Register Global Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Register Global HttpException Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error on unapproved fields
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AyuNet Core API')
    .setDescription('Enterprise AyuNet Core backend platform infrastructure APIs')
    .setVersion('1.0.0')
    .addTag('Health', 'System Operational Checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  appLogger.log(`AyuNet Core Backend service started on port ${port}`, 'Bootstrap');
  appLogger.log(`Swagger documentation available at http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
