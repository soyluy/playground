import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const SKIP_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  const shouldSkip = SKIP_AUTH_ENDPOINTS.some((path) => req.url.includes(path));
  const accessToken = authService.accessToken();
  const authReq =
    !shouldSkip && accessToken
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || shouldSkip) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((nextToken) => {
          if (!nextToken) {
            return throwError(() => error);
          }

          return next(
            req.clone({
              method: 'PUT',
              setHeaders: {
                Authorization: `Bearer ${nextToken}`,
              },
            }),
          );
        }),
        catchError((refreshError) => {
          authService.logout().subscribe();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
