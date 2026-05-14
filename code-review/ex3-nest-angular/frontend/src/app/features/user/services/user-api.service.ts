import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { User } from '../../../core/models/user.model';
import { Transaction } from '../../../core/models/transaction.model';
import { Auction } from '../../../core/models/auction.model';

type BalanceResponse = {
  balance: number;
};

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(
    private readonly _http: HttpClient,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {}

  getProfile(): Observable<User> {
    return this._http.get<User>(`${this._apiBaseUrl}${API_ENDPOINTS.users.me}`);
  }

  updateProfile(payload: Partial<User>): Observable<User> {
    return this._http.patch<User>(`${this._apiBaseUrl}${API_ENDPOINTS.users.me}`, payload);
  }

  getBalance(): Observable<BalanceResponse> {
    return this._http.get<BalanceResponse>(`${this._apiBaseUrl}${API_ENDPOINTS.users.me}`);
  }

  deposit(payload: {
    amount: number;
    reference: string;
    description?: string;
  }): Observable<BalanceResponse> {
    return this._http.post<BalanceResponse>(
      `${this._apiBaseUrl}${API_ENDPOINTS.users.deposit}`,
      payload,
    );
  }

  withdraw(payload: {
    amount: number;
    reference: string;
    description?: string;
  }): Observable<BalanceResponse> {
    return this._http.post<BalanceResponse>(
      `${this._apiBaseUrl}${API_ENDPOINTS.users.withdraw}`,
      payload,
    );
  }

  getTransactions(params: {
    limit?: number;
    offset?: number;
  }): Observable<{ data: Transaction[]; total: number }> {
    return this._http.get<{ data: Transaction[]; total: number }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.users.transactions}`,
      { params: params as never },
    );
  }

  getWatchlist(): Observable<Auction[]> {
    return this._http.get<Auction[]>(
      `${this._apiBaseUrl}${API_ENDPOINTS.users.watchlist}`,
    );
  }
}
