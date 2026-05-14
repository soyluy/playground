import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { AuctionItem } from '../../../core/models/auction-item.model';

@Injectable({ providedIn: 'root' })
export class AuctionItemApiService {
  constructor(
    private readonly _http: HttpClient,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {}

  createItem(payload: Partial<AuctionItem>): Observable<AuctionItem> {
    return this._http.post<AuctionItem>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.root}`,
      payload,
    );
  }

  updateItem(itemId: string, payload: Partial<AuctionItem>): Observable<AuctionItem> {
    return this._http.patch<AuctionItem>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.byId(itemId)}`,
      payload,
    );
  }

  deleteItem(itemId: string): Observable<{ success: boolean }> {
    return this._http.delete<{ success: boolean }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.byId(itemId)}`,
    );
  }

  getItem(itemId: string): Observable<AuctionItem> {
    return this._http.get<AuctionItem>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.byId(itemId)}`,
    );
  }

  getUserItems(limit: number = 20, offset: number = 0): Observable<{
    data: AuctionItem[];
    total: number;
  }> {
    return this._http.get<{ data: AuctionItem[]; total: number }>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.mine}`,
      { params: { limit, offset } as never },
    );
  }

  submitItem(itemId: string): Observable<AuctionItem> {
    return this._http.post<AuctionItem>(
      `${this._apiBaseUrl}${API_ENDPOINTS.items.submit(itemId)}`,
      {},
    );
  }
}
