import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly _configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
    const isProd = this._configService.get<string>('NODE_ENV') === 'production';

    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray((payload as Record<string, unknown>).message)
          ? (payload as Record<string, unknown>).message
          : ((payload as Record<string, unknown>).message ?? 'Request failed');

    response.status(status).json({
      statusCode: status,
      error:
        typeof payload === 'string'
          ? payload
          : ((payload as Record<string, unknown>).error ?? HttpStatus[status]),
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      ...(isProd ? {} : { details: this.extractDetails(payload, exception) }),
    });
  }

  private extractDetails(
    payload: unknown,
    exception: unknown,
  ): Record<string, unknown> | undefined {
    if (typeof payload === 'object' && payload !== null) {
      return payload as Record<string, unknown>;
    }

    if (exception instanceof Error) {
      return { stack: exception.stack };
    }

    return undefined;
  }
}
