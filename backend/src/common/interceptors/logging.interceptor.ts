import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;
          this.logger.log(
            `[${method}] ${url} - Status: ${statusCode} - ${duration}ms - IP: ${ip} - UA: ${userAgent}`,
          );
        },
        error: (err: any) => {
          const duration = Date.now() - now;
          const statusCode = err.status || 500;
          this.logger.error(
            `[${method}] ${url} - Status: ${statusCode} - ${duration}ms - IP: ${ip} - UA: ${userAgent} - Error: ${err.message}`,
          );
        },
      }),
    );
  }
}
