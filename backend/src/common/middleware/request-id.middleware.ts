import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContext } from '../utilities/request-context.utility';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Set response header
    res.setHeader('x-request-id', requestId);

    // Attach to request object for express lifecycle compatibility
    (req as any).id = requestId;

    // Execute subsequent pipeline in AsyncLocalStorage context
    RequestContext.run({ requestId }, () => {
      next();
    });
  }
}
