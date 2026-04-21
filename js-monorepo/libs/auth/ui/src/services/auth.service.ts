import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '@hub/user-api';
import { catchError, EMPTY, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpClient);

  private readonly _user: WritableSignal<User | null> = signal(null);

  public loadUser(): Observable<void> {
    return this._http.get<User>('/api/auth/me').pipe(
      tap((user) => this._user.set(user)),
      catchError(() => {
        this._user.set(null);
        return EMPTY;
      }),
      map(() => void 0),
    );
  }

  get user(): Signal<User | null> {
    return this._user.asReadonly();
  }
}
