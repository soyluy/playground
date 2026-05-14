import { Injectable, signal } from '@angular/core';
import { Subscription, interval } from 'rxjs';

import { AuctionStatus } from '../../../core/models/auction.model';
import { SOCKET_EVENTS } from '../../../core/constants/socket.constants';
import { SocketService } from '../../../core/services/socket.service';

@Injectable({ providedIn: 'root' })
export class AuctionRealtimeService {
  private readonly _currentAuctionId = signal<string | null>(null);
  readonly currentPrice = signal<number>(0);
  readonly bidCount = signal<number>(0);
  readonly timeRemaining = signal<number>(0);
  readonly status = signal<AuctionStatus>(AuctionStatus.DRAFT);

  private _countdownEndAt: number | null = null;
  private _countdownTickSub: Subscription | null = null;
  private _socketSubs: Subscription[] = [];

  constructor(private readonly _socketService: SocketService) {}

  joinAuction(auctionId: string): void {
    this._currentAuctionId.set(auctionId);
    this._socketService.connect('auction');
    this._socketService.joinAuction(auctionId);
    this.bindSocketEvents(auctionId);
  }

  leaveAuction(): void {
    const auctionId = this._currentAuctionId();
    if (!auctionId) {
      return;
    }

    this._socketService.leaveAuction(auctionId);
    this._currentAuctionId.set(null);
    this.stopCountdown();
    this.clearSubscriptions();
  }

  destroy(): void {
    this.leaveAuction();
    this._socketService.disconnect();
  }

  private bindSocketEvents(auctionId: string): void {
    this._socketSubs.push(
      this._socketService.on<{ auctionId: string; amount: number }>(SOCKET_EVENTS.BID_PLACED).subscribe((event) => {
        if (event.auctionId !== auctionId) {
          return;
        }
        this.currentPrice.set(event.amount);
        this.bidCount.update((count) => count + 1);
      }),
    );

    this._socketSubs.push(
      this._socketService
        .on<{ auctionId: string; newEndTime: string }>(SOCKET_EVENTS.AUCTION_EXTENDED)
        .subscribe((event) => {
          if (event.auctionId !== auctionId) {
            return;
          }
          this.startCountdownByEndTime(event.newEndTime);
        }),
    );

    this._socketSubs.push(
      this._socketService.on<{ auctionId: string }>(SOCKET_EVENTS.AUCTION_ENDED).subscribe((event) => {
        if (event.auctionId !== auctionId) {
          return;
        }
        this.status.set(AuctionStatus.ENDED);
        this.timeRemaining.set(0);
        this.stopCountdown();
      }),
    );

    this._socketSubs.push(
      this._socketService
        .on<{ auctionId: string; currentPrice: number }>(SOCKET_EVENTS.DUTCH_PRICE_UPDATE)
        .subscribe((event) => {
          if (event.auctionId !== auctionId) {
            return;
          }
          this.currentPrice.set(event.currentPrice);
        }),
    );

    this._socketSubs.push(
      this._socketService
        .on<{ auctionId: string; remainingSeconds: number }>(SOCKET_EVENTS.COUNTDOWN_UPDATE)
        .subscribe((event) => {
          if (event.auctionId !== auctionId) {
            return;
          }
          this.timeRemaining.set(event.remainingSeconds);
          this.startCountdownFromSeconds(event.remainingSeconds);
        }),
    );
  }

  private startCountdownFromSeconds(seconds: number): void {
    this._countdownEndAt = Date.now() + seconds * 1000;
    this.startTimer();
  }

  private startCountdownByEndTime(endTime: string): void {
    this._countdownEndAt = new Date(endTime).getTime();
    this.startTimer();
  }

  private startTimer(): void {
    this.stopCountdown();
    this._countdownTickSub = interval(1000).subscribe(() => {
      if (!this._countdownEndAt) {
        this.timeRemaining.set(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.floor((this._countdownEndAt - Date.now()) / 1000),
      );
      this.timeRemaining.set(remaining);

      if (remaining === 0) {
        this.stopCountdown();
      }
    });
  }

  private stopCountdown(): void {
    this._countdownTickSub?.unsubscribe();
    this._countdownTickSub = null;
    this._countdownEndAt = null;
  }

  private clearSubscriptions(): void {
    this._socketSubs.forEach((sub) => sub.unsubscribe());
    this._socketSubs = [];
  }
}
