import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly _logger = inject(Logger);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;
    const path = request.originalUrl as string;
    const startedAt = Date.now();

    const body = this.maskSensitive(request.body);
    this._logger.log(
      `[REQ] ${method} ${path} body=${JSON.stringify(body)}`,
      LoggingInterceptor.name,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this._logger.log(
            `[RES] ${method} ${path} ${Date.now() - startedAt}ms`,
            LoggingInterceptor.name,
          );
        },
        error: (error: unknown) => {
          const message = error instanceof Error ? error.message : 'unknown';
          this._logger.warn(
            `[ERR] ${method} ${path} ${Date.now() - startedAt}ms message=${message}`,
            LoggingInterceptor.name,
          );
        },
      }),
    );
  }

  private maskSensitive(payload: unknown): unknown {
    if (Array.isArray(payload)) {
      return payload.map((entry) => this.maskSensitive(entry));
    }

    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const hiddenKeys = new Set([
      'password',
      'passwordHash',
      'refreshToken',
      'token',
      'authorization',
    ]);

    const nextValue: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (hiddenKeys.has(key)) {
        nextValue[key] = '***';
        continue;
      }

      nextValue[key] = this.maskSensitive(value);
    }

    return nextValue;
  }
}
