import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();

      const correlationId = (request.headers['x-correlation-id'] as string) || crypto.randomUUID();
      request.headers['x-correlation-id'] = correlationId;
      response.setHeader('X-Correlation-Id', correlationId);

      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          const duration = Date.now() - startTime;
          console.log(`[REQUEST] ${request.method} ${request.url} - ${response.statusCode} (${duration}ms) [CID: ${correlationId}]`);
        })
      );
    }
    return next.handle();
  }
}
