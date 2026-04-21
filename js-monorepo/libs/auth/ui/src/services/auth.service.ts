import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '@hub/user-api';
import { catchError, EMPTY, map, Observable, shareReplay, tap } from 'rxjs';

type State = 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpClient);

  private readonly _state: WritableSignal<State> = signal('loading');

  private readonly _user: WritableSignal<User | null> = signal(null);

  public loadUser(): Observable<void> {
    this._state.set('loading');
    const obs = this._http.get<User>('/api/auth/me').pipe(
      tap((user) => {
        this._user.set(user);
        this._state.set('success');
      }),
      catchError((error) => {
        console.error('error loading user', error);
        this._user.set(null);
        this._state.set('error');
        return EMPTY;
      }),
      map(() => void 0),
      shareReplay(1),
    );
    obs.subscribe();
    return obs;
  }

  get user(): Signal<User | null> {
    return this._user.asReadonly();
  }

  get state(): Signal<State> {
    return this._state.asReadonly();
  }
}
