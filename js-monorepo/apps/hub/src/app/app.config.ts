import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEnvironment } from '@hub/ui-infra';
import { environment } from '../environments/environment';
import { provideNativeDateAdapter } from '@angular/material/core';
import { withCredentialsInterceptor } from '@hub/ui-infra';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
    provideEnvironment(environment),
    provideNativeDateAdapter(),
  ],
};
