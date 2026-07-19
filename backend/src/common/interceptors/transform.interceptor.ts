import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestContext } from '../utilities/request-context.utility';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const requestId = RequestContext.requestId || 'unknown';

    return next.handle().pipe(
      map((data) => {
        // Bypass if already formatted
        if (data && typeof data === 'object' && 'success' in data && 'requestId' in data) {
          return data;
        }

        let message = 'Success';
        let responseData = data;

        // If the return object contains message and data fields, split them nicely
        if (data && typeof data === 'object') {
          if ('message' in data && 'data' in data && Object.keys(data).length === 2) {
            message = data.message;
            responseData = data.data;
          } else if ('message' in data && Object.keys(data).length === 1) {
            message = data.message;
            responseData = null;
          }
        }

        return {
          success: true,
          message,
          data: responseData ?? {},
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
