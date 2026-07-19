import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { RequestContext } from '../common/utilities/request-context.utility';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger: winston.Logger;
  private context: string = 'App';

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || 'info';

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
        const requestId = RequestContext.requestId || 'system';
        const logContext = context || this.context;

        if (isProduction) {
          return JSON.stringify({
            timestamp,
            level,
            message,
            context: logContext,
            requestId,
            stack,
            ...meta,
          });
        }

        const colorizer = winston.format.colorize();
        const coloredLevel = colorizer.colorize(level, level.toUpperCase().padEnd(7));
        const coloredContext = `\x1b[33m[${logContext}]\x1b[0m`;
        const reqStr = `\x1b[32m[reqId: ${requestId}]\x1b[0m`;
        const stackStr = stack ? `\n\x1b[31m${stack}\x1b[0m` : '';
        const metaStr = Object.keys(meta).length > 0 ? ` - ${JSON.stringify(meta)}` : '';

        return `${timestamp} ${coloredLevel} ${reqStr} ${coloredContext} ${message}${metaStr}${stackStr}`;
      }),
    );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: logLevel,
        format: isProduction
          ? winston.format.combine(winston.format.timestamp(), winston.format.json())
          : winston.format.combine(winston.format.timestamp(), logFormat),
      }),
    ];

    if (isProduction) {
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: logLevel,
          maxFiles: '30d',
          maxSize: '20m',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      stack: trace,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }
}
