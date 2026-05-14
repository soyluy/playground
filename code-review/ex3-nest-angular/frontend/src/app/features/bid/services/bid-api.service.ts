import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { AutoBid, Bid, BidHistory } from '../../../core/models/bid.model';

@Injectable({ providedIn: 'root' })
export class BidApiService {
  constructor(
    private readonly _http: HttpClient,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {}

  placeBid(auctionId: string, amount: number): Observable<Bid> {
    return this._http.post<Bid>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.bids(auctionId)}`,
      { amount },
    );
  }

  retractBid(bidId: string): Observable<Bid> {
    return this._http.delete<Bid>(`${this._apiBaseUrl}/bids/${bidId}`);
  }

  getBidHistory(
    auctionId: string,
    page: number = 1,
    limit: number = 20,
  ): Observable<BidHistory> {
    return this._http.get<BidHistory>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.bids(auctionId)}`,
      { params: { page, limit } as never },
    );
  }

  setAutoBid(auctionId: string, maxAmount: number): Observable<AutoBid> {
    return this._http.post<AutoBid>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.autoBid(auctionId)}`,
      { maxAmount },
    );
  }

  cancelAutoBid(auctionId: string): Observable<{ success: boolean }> {
    return this._http.delete<{ success: boolean }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.autoBid(auctionId)}`,
    );
  }

  getAutoBid(auctionId: string): Observable<AutoBid | null> {
    return this._http.get<AutoBid | null>(
      `${this._apiBaseUrl}${API_ENDPOINTS.auctions.autoBid(auctionId)}`,
    );
  }
}
