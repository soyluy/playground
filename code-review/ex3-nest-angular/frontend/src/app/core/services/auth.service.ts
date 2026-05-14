import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { User, UserRole } from '../models/user.model';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _apiBase = inject(API_BASE_URL);

  private readonly _currentUser = signal<User | null>(this.readPersistedUser());
  private readonly _accessToken = signal<string | null>(this.readPersistedAccessToken());
  private readonly _refreshToken = signal<string | null>(this.readPersistedRefreshToken());
  private readonly _refresh = signal(0);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly hasRole = computed(
    () =>
      (roles: UserRole[]) =>
        this._currentUser() !== null && roles.includes(this._currentUser()!.role),
  );

  readonly userProfile = toSignal(
    toObservable(computed(() => [this._refresh(), this._accessToken()] as const)).pipe(
      switchMap(([, token]) => {
        if (!token) {
          return of(null);
        }

        return this._http.get<User>(`${this._apiBase}${API_ENDPOINTS.users.me}`).pipe(
          tap((user) => {
            this._currentUser.set(user);
            localStorage.setItem('auction.user', JSON.stringify(user));
          }),
          catchError(() => of(null)),
        );
      }),
    ),
    { initialValue: this._currentUser() },
  );

  login(payload: LoginPayload) {
    return this._http
      .post<{ user: User; accessToken: string; refreshToken: string }>(
        `${this._apiBase}${API_ENDPOINTS.auth.login}`,
        payload,
      )
      .pipe(
        tap((response) => {
          this.applySession(response.user, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        }),
      );
  }

  register(payload: RegisterPayload) {
    return this._http
      .post<{ user: User; tokens: AuthTokens }>(
        `${this._apiBase}${API_ENDPOINTS.auth.register}`,
        payload,
      )
      .pipe(
        tap((response) => {
          this.applySession(response.user, response.tokens);
        }),
      );
  }

  logout() {
    const token = this._refreshToken();
    return this._http
      .post(`${this._apiBase}${API_ENDPOINTS.auth.logout}`, {
        refreshToken: token,
      })
      .pipe(
        tap(() => {
          this.clearSession();
          this._router.navigateByUrl('/auth/login');
        }),
        catchError(() => {
          this._currentUser.set(null);
          this._accessToken.set(null);
          this._refreshToken.set(null);
          this._router.navigateByUrl('/auth/login');
          return of(null);
        }),
      );
  }

  refreshToken() {
    const refreshToken = this._refreshToken();
    if (!refreshToken) {
      return of(null);
    }

    return this._http
      .post<AuthTokens>(`${this._apiBase}${API_ENDPOINTS.auth.refresh}`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this._accessToken.set(tokens.accessToken);
          this._refreshToken.set(tokens.refreshToken);
          localStorage.setItem('auction.access_token', tokens.accessToken);
          localStorage.setItem('auction.refresh_token', tokens.refreshToken);
        }),
        map((tokens) => tokens.accessToken),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      );
  }

  accessToken() {
    return this._accessToken();
  }

  refreshTrigger() {
    this._refresh.update((value) => value + 1);
  }

  private applySession(user: User, tokens: AuthTokens): void {
    this._currentUser.set(user);
    this._accessToken.set(tokens.accessToken);
    this._refreshToken.set(tokens.refreshToken);
    localStorage.setItem('auction.user', JSON.stringify(user));
    localStorage.setItem('auction.access_token', tokens.accessToken);
    localStorage.setItem('auction.refresh_token', tokens.refreshToken);
    this.refreshTrigger();
  }

  private clearSession(): void {
    this._currentUser.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    localStorage.removeItem('auction.user');
    localStorage.removeItem('auction.access_token');
  }

  private readPersistedUser(): User | null {
    const raw = localStorage.getItem('auction.user');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private readPersistedAccessToken(): string | null {
    return localStorage.getItem('auction.access_token');
  }

  private readPersistedRefreshToken(): string | null {
    return localStorage.getItem('auction.refresh_token');
  }
}
