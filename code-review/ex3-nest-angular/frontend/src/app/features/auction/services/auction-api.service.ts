import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Auction, AuctionStats } from '../../../core/models/auction.model';
import { PaginatedResponse, PaginationParams } from '../../../core/models/pagination.model';

type AuctionSearchParams = PaginationParams & {
  q?: string;
  status?: string;
  type?: string;
  categorySlug?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
};

type CreateAuctionPayload = {
  itemId: string;
  type: string;
  startTime: string;
  endTime: string;
  startingPrice: number;
  reservePrice?: number | null;
  buyNowPrice?: number | null;
  bidIncrement?: number;
  extensionMinutes?: number;
  extensionThresholdSeconds?: number;
};

@Injectable({ providedIn: 'root' })
export class AuctionApiService {
  constructor(
    private readonly _http: HttpClient,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {}

  getAuctions(params: PaginationParams): Observable<PaginatedResponse<Auction>> {
    return this._http.get<PaginatedResponse<Auction>>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.root}`,
      { params: this.toQueryParams(params) },
    );
  }

  getAuction(auctionId: string): Observable<Auction> {
    return this._http.get<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.byId(auctionId)}`,
    );
  }

  searchAuctions(params: AuctionSearchParams): Observable<PaginatedResponse<Auction>> {
    return this._http.get<PaginatedResponse<Auction>>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.search}`,
      { params: this.toQueryParams(params) },
    );
  }

  createAuction(payload: CreateAuctionPayload): Observable<Auction> {
    return this._http.post<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.root}`,
      payload,
    );
  }

  updateAuction(auctionId: string, payload: Partial<CreateAuctionPayload>): Observable<Auction> {
    return this._http.patch<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.byId(auctionId)}`,
      payload,
    );
  }

  cancelAuction(auctionId: string): Observable<Auction> {
    return this._http.post<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.cancel(auctionId)}`,
      {},
    );
  }

  publishAuction(auctionId: string): Observable<Auction> {
    return this._http.post<Auction>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.publish(auctionId)}`,
      {},
    );
  }

  watchAuction(auctionId: string): Observable<{ success: boolean }> {
    return this._http.post<{ success: boolean }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.watch(auctionId)}`,
      {},
    );
  }

  unwatchAuction(auctionId: string): Observable<{ success: boolean }> {
    return this._http.post<{ success: boolean }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.unwatch(auctionId)}`,
      {},
    );
  }

  buyNow(auctionId: string): Observable<{ paymentIntentId: string; clientSecret: string }> {
    return this._http.post<{ paymentIntentId: string; clientSecret: string }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.buyNow(auctionId)}`,
      {},
    );
  }

  getAuctionStats(auctionId: string): Observable<AuctionStats> {
    return this._http.get<AuctionStats>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.stats(auctionId)}`,
    );
  }

  private toQueryParams(input: Record<string, unknown>): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      params[key] = String(value);
    }
    return params;
  }
}
