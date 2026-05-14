import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth.service';
import { Auction } from '../../../../core/models/auction.model';
import { canBuyNow, canPlaceBid } from '../../../../core/utils/auction.utils';
import { formatCurrency } from '../../../../core/utils/format.utils';
import { AuctionApiService } from '../../services/auction-api.service';
import { AuctionRealtimeService } from '../../services/auction-realtime.service';
import { BidStateService } from '../../../bid/services/bid-state.service';
import { AuctionCountdownComponent } from '../../components/auction-countdown/auction-countdown';
import { BidHistoryComponent } from '../../components/bid-history/bid-history';

@Component({
  selector: 'app-auction-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuctionCountdownComponent,
    BidHistoryComponent,
  ],
  templateUrl: './auction-detail.html',
  styleUrl: './auction-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionDetailPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _auctionApi = inject(AuctionApiService);
  private readonly _auctionRealtime = inject(AuctionRealtimeService);
  private readonly _bidState = inject(BidStateService);
  readonly auth = inject(AuthService);

  readonly auction = signal<Auction | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly isWatching = signal<boolean>(false);

  readonly currentPrice = this._auctionRealtime.currentPrice;
  readonly timeRemaining = this._auctionRealtime.timeRemaining;
  readonly bidCount = this._auctionRealtime.bidCount;
  readonly status = this._auctionRealtime.status;

  readonly canShowBidPanel = computed(() => {
    const item = this.auction();
    const user = this.auth.currentUser();
    if (!item || !user) {
      return false;
    }
    return canPlaceBid(item, item.currentPrice + item.bidIncrement);
  });

  readonly canShowBuyNow = computed(() => {
    const item = this.auction();
    return item ? canBuyNow(item) : false;
  });

  readonly auctionSync = toSignal(
    this._route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => !!id),
      tap((id) => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap((id) => this._auctionApi.getAuction(id)),
      tap((auction) => {
        this.auction.set(auction);
        this.currentPrice.set(auction.currentPrice);
        this.status.set(auction.status);
        this._auctionRealtime.joinAuction(auction.id);
        this._bidState.loadBidHistory(auction.id).subscribe();
        this.loading.set(false);
      }),
    ),
    { initialValue: null },
  );

  ngOnDestroy(): void {
    this._auctionRealtime.leaveAuction();
  }

  buyNow(): void {
    const auction = this.auction();
    if (!auction) {
      return;
    }

    this._auctionApi.buyNow(auction.id).subscribe();
  }

  toggleWatch(): void {
    const auction = this.auction();
    if (!auction) {
      return;
    }

    if (this.isWatching()) {
      this._auctionApi.unwatchAuction(auction.id).subscribe(() => {
        this.isWatching.set(false);
      });
      return;
    }

    this._auctionApi.watchAuction(auction.id).subscribe(() => {
      this.isWatching.set(true);
    });
  }

  placeQuickBid(): void {
    const auction = this.auction();
    const user = this.auth.currentUser();
    if (!auction || !user) {
      return;
    }

    const nextBid = auction.currentPrice + auction.bidIncrement;
    this._bidState.placeBid(auction.id, nextBid, user.id).subscribe();
  }

  onAuctionEnded(): void {
    this.status.set(this.auction()?.status ?? this.status());
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }
}
