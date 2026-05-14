import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

type ApiResponse<T> = {
  data: T;
  timestamp: string;
  path: string;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.originalUrl as string;

    return next.handle().pipe(
      map((data) => ({
        data: this.sanitize(data) as T,
        timestamp: new Date().toISOString(),
        path,
      })),
    );
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item)).filter(Boolean);
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const nextValue: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const cleaned = this.sanitize(entry);
      if (cleaned) {
        nextValue[key] = cleaned;
      }
    }

    return nextValue;
  }
}
