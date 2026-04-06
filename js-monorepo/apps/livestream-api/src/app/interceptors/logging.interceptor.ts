import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

type HttpRequestLike = {
  method?: string;
  originalUrl?: string;
  url?: string;
  body?: unknown;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<HttpRequestLike>();
      const method = request.method ?? 'UNKNOWN_METHOD';
      const route = request.originalUrl ?? request.url ?? 'UNKNOWN_ROUTE';
      const hasBody = this.hasBody(request.body);

      if (hasBody) {
        this.logger.log(`${method} ${route} body=${this.safeStringify(request.body)}`);
      } else {
        this.logger.log(`${method} ${route}`);
      }
    }

    return next.handle();
  }

  private hasBody(body: unknown): boolean {
    if (body === null || body === undefined) {
      return false;
    }

    if (typeof body === 'object') {
      return Object.keys(body as Record<string, unknown>).length > 0;
    }

    return true;
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '[unserializable body]';
    }
  }
}
