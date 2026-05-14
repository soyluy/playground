import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const msg = mapHttpError(error);
        snackBar.open(msg, 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      } else {
        snackBar.open('Something went wrong. Please try again.', 'Dismiss', {
          duration: 5000,
        });
      }

      return throwError(() => error);
    }),
  );
};

function mapHttpError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Unable to connect to server.';
  }

  if (error.status === 400) {
    return 'Request is not valid.';
  }

  if (error.status === 401) {
    return 'Session expired. Please login again.';
  }

  if (error.status === 403) {
    return 'You do not have permission for this action.';
  }

  if (error.status === 404) {
    return 'Requested resource was not found.';
  }

  if (error.status >= 500) {
    return 'Server error. Please retry in a moment.';
  }

  return 'Request failed.';
}
