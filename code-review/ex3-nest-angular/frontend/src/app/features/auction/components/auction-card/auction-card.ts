import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Auction } from '../../../../core/models/auction.model';
import {
  formatAuctionStatus,
  formatBidCount,
  formatCurrency,
  formatTimeRemaining,
} from '../../../../core/utils/format.utils';

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './auction-card.html',
  styleUrl: './auction-card.scss',
})
export class AuctionCardComponent {
  private readonly _router = inject(Router);

  @Input({ required: true }) auction!: any;

  readonly displayPrice = signal<number>(0);
  readonly remainingLabel = signal<string>('Ended');

  readonly statusLabel = computed(() =>
    this.auction ? formatAuctionStatus(this.auction.status) : 'Unknown',
  );
  readonly bidLabel = computed(() =>
    this.auction ? formatBidCount(this.auction.bidCount ?? 0) : '0 bids',
  );

  private _tickSub: Subscription | null = null;

  ngOnInit(): void {
    if (this.auction) {
      this.displayPrice.set(this.auction.currentPrice ?? 0);
      this.remainingLabel.set(formatTimeRemaining(this.auction.endTime));
    }
  }

  ngOnChanges(): void {
    this.remainingLabel.set(formatTimeRemaining(this.auction.endTime));
    this._tickSub = interval(1000).subscribe(() => {
      this.remainingLabel.set(formatTimeRemaining(this.auction.endTime));
    });
  }

  openAuction(): void {
    this._router.navigate(['/auctions', this.auction.id]);
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }
}
