import { APP_INTERCEPTOR } from '@nestjs/core';
import { DevLoggingInterceptor } from '../interceptors/logging.interceptor';

export function httpLoggerProvider() {
  const env = process.env['NODE_ENV'];
  const isDevelopment = env === 'development';
  if (isDevelopment) {
    return [
      {
        provide: APP_INTERCEPTOR,
        useFactory: () => new DevLoggingInterceptor(),
      },
    ];
  } else {
    return [];
  }
}
