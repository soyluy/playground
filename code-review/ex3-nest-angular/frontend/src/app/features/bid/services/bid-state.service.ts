import { Injectable, computed, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

import { Bid, AutoBid } from '../../../core/models/bid.model';
import { BidApiService } from './bid-api.service';

@Injectable({ providedIn: 'root' })
export class BidStateService {
  private readonly _bids = signal<Bid[]>([]);
  private readonly _userBid = signal<Bid | null>(null);
  private readonly _autoBid = signal<AutoBid | null>(null);
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _refresh = signal<number>(0);

  readonly bids = computed(() => this._bids());
  readonly userBid = computed(() => this._userBid());
  readonly autoBid = computed(() => this._autoBid());
  readonly isSubmitting = computed(() => this._isSubmitting());

  constructor(private readonly _bidApiService: BidApiService) {}

  placeBid(auctionId: string, amount: number, userId: string) {
    const optimisticBid: Bid = {
      id: `tmp-${Date.now()}`,
      auctionId,
      bidderId: userId,
      amount,
      isAutoBid: false,
      maxAutoBidAmount: null,
      isWinning: true,
      isRetracted: false,
      retractedAt: null,
      createdAt: new Date().toISOString(),
    };

    this._isSubmitting.set(true);
    this._bids.update((current) => [optimisticBid, ...current]);
    this._userBid.set(optimisticBid);

    return this._bidApiService.placeBid(auctionId, amount).pipe(
      tap((savedBid) => {
        this._bids.update((current) =>
          [savedBid, ...current.filter((bid) => bid.id !== optimisticBid.id)].sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
          ),
        );
        this._userBid.set(savedBid);
        this._isSubmitting.set(false);
        this.refresh();
      }),
      catchError((error) => {
        this._isSubmitting.set(false);
        return of(error);
      }),
    );
  }

  loadBidHistory(auctionId: string, page: number = 1, limit: number = 20) {
    return this._bidApiService.getBidHistory(auctionId, page, limit).pipe(
      tap((history) => {
        this._bids.set(history.data ?? []);
      }),
    );
  }

  loadUserBid(auctionId: string, userId: string) {
    return this.loadBidHistory(auctionId, 1, 100).pipe(
      tap(() => {
        const bid = this._bids().find((entry) => entry.bidderId === userId && !entry.isRetracted);
        this._userBid.set(bid ?? null);
      }),
    );
  }

  loadAutoBid(auctionId: string) {
    return this._bidApiService.getAutoBid(auctionId).pipe(
      tap((autoBid) => {
        this._autoBid.set(autoBid);
      }),
    );
  }

  setAutoBid(auctionId: string, maxAmount: number) {
    return this._bidApiService.setAutoBid(auctionId, maxAmount).pipe(
      tap((autoBid) => {
        this._autoBid.set(autoBid);
      }),
    );
  }

  cancelAutoBid(auctionId: string) {
    return this._bidApiService.cancelAutoBid(auctionId).pipe(
      tap(() => {
        this._autoBid.set(null);
      }),
    );
  }

  refresh(): void {
    this._refresh.update((value) => value + 1);
  }
}
