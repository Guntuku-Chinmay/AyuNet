import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application operational health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is operational and healthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'System is healthy' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'up' },
            version: { type: 'string', example: '1.0.0' },
            uptime: { type: 'number', example: 45.67 },
            timestamp: { type: 'string', example: '2026-07-19T08:00:00.000Z' },
            details: {
              type: 'object',
              properties: {
                appName: { type: 'string', example: 'AyuNet Core Backend' },
                environment: { type: 'string', example: 'development' },
                database: { type: 'string', example: 'up' },
                redis: { type: 'string', example: 'not_configured' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2026-07-19T08:00:00.000Z' },
        requestId: { type: 'string', example: 'bca83d31-419b-4395-8e2a-a925f6e3c042' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is degraded or unhealthy',
  })
  async getHealth() {
    const health = await this.healthService.checkHealth();

    if (health.status === 'down') {
      throw new ServiceUnavailableException({
        message: 'System is unhealthy',
        data: health,
      });
    }

    return {
      message: 'System is healthy',
      data: health,
    };
  }
}
