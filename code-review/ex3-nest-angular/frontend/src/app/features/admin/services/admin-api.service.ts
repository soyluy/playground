import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Auction } from '../../../core/models/auction.model';
import { User } from '../../../core/models/user.model';

type AdminStats = {
  totalUsers: number;
  activeAuctions: number;
  bannedUsers: number;
};

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(
    private readonly _http: HttpClient,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {}

  getStats(): Observable<AdminStats> {
    return this._http.get<AdminStats>(`${this._apiBaseUrl}${API_ENDPOINTS.admin.stats}`);
  }

  getAuctions(status?: string): Observable<Auction[] | { data: Auction[]; total: number }> {
    return this._http.get<Auction[] | { data: Auction[]; total: number }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.auctions}`,
      { params: status ? ({ status } as never) : undefined },
    );
  }

  getUsers(q?: string): Observable<User[]> {
    return this._http.get<User[]>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.users}`,
      { params: q ? ({ q } as never) : undefined },
    );
  }

  banUser(userId: string): Observable<User> {
    return this._http.post<User>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.banUser(userId)}`,
      {},
    );
  }

  unbanUser(userId: string): Observable<User> {
    return this._http.post<User>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.unbanUser(userId)}`,
      {},
    );
  }

  forceEndAuction(auctionId: string): Observable<Auction> {
    return this._http.post<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.forceEndAuction(auctionId)}`,
      {},
    );
  }

  getRevenueReport(): Observable<{ revenue: number; transactionCount: number }> {
    return this._http.get<{ revenue: number; transactionCount: number }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.admin.revenue}`,
    );
  }

  getActivityReport(): Observable<{
    activeAuctions: number;
    endedAuctions: number;
    bannedUsers: number;
    generatedAt: string;
  }> {
    return this._http.get<{
      activeAuctions: number;
      endedAuctions: number;
      bannedUsers: number;
      generatedAt: string;
    }>(`${this._apiBaseUrl}${API_ENDPOINTS.admin.activity}`);
  }
}
