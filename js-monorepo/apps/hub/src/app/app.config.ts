import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEnvironment } from '@hub/ui-infra';
import { environment } from '../environments/environment';
import { provideNativeDateAdapter } from '@angular/material/core';
import { withCredentialsInterceptor } from '@hub/ui-infra';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
    provideEnvironment(environment),
    provideNativeDateAdapter(),
    provideApollo(() => {
      const httpLink = inject(HttpLink); // Use Angular's DI to get the link service

      return {
        link: ApolloLink.from([
          // Add any middlewares here (e.g., authLink)
          httpLink.create({
            uri: environment.apiUrl + '/graphql',
          }),
        ]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
