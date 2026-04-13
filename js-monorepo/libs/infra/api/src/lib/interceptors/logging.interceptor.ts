import { Injectable } from '@nestjs/common';
import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';

type ColorFn = (text: string) => string;

@Injectable()
export class DevLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method ?? 'UNKNOWN_METHOD';
    const route = request.originalUrl ?? request.url ?? 'UNKNOWN_ROUTE';
    const hasBody = this.hasBody(request.body);

    const reqId = randomUUID().slice(0, 8);
    const colorer = this.pickColor(reqId);

    if (hasBody) {
      console.log(
        colorer(
          `[${reqId}] ${method} ${route} body=${JSON.stringify(request.body)}`,
        ),
      );
    } else {
      console.log(colorer(`[${reqId}] ${method} ${route}`));
    }

    return next.handle().pipe(
      tap({
        next: (value) => {
          console.log(
            colorer(
              `✅[${reqId}] ${method} ${route} response=${JSON.stringify(value)}`,
            ),
          );
        },
        error: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : JSON.stringify(error);
          console.error(
            colorer(`❌[${reqId}] ${method} ${route} error=${errorMessage}`),
          );
        },
        complete: () => {
          console.log(colorer(`[${reqId}] ${method} ${route} complete`));
        },
      }),
    );
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

  private pickColor(reqId: string): ColorFn {
    const colors: ColorFn[] = [
      (text) => `\x1b[36m${text}\x1b[0m`, // cyan
      (text) => `\x1b[32m${text}\x1b[0m`, // green
      (text) => `\x1b[35m${text}\x1b[0m`, // magenta
      (text) => `\x1b[34m${text}\x1b[0m`, // blue
      (text) => `\x1b[33m${text}\x1b[0m`, // yellow
      (text) => `\x1b[37m${text}\x1b[0m`, // white
    ];

    let hash = 0;
    for (let i = 0; i < reqId.length; i++) {
      hash = (hash * 31 + reqId.charCodeAt(i)) | 0;
    }

    return colors[Math.abs(hash) % colors.length];
  }
}
