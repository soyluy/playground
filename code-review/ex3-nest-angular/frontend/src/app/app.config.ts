import { ApplicationConfig, InjectionToken } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_BASE_URL } from './core/constants/api.constants';

export const SOCKET_IO_URL = new InjectionToken<string>('SOCKET_IO_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: 'http://localhost:3000/api',
    },
    {
      provide: SOCKET_IO_URL,
      useValue: 'http://localhost:3000',
    },
  ],
};
