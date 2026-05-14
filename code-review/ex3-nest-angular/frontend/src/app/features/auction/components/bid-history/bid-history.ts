import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../../core/services/auth.service';
import { Bid } from '../../../../core/models/bid.model';
import { formatCurrency } from '../../../../core/utils/format.utils';
import { BidStateService } from '../../../bid/services/bid-state.service';

@Component({
  selector: 'app-bid-history',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './bid-history.html',
  styleUrl: './bid-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BidHistoryComponent {
  private readonly _bidState = inject(BidStateService);
  private readonly _auth = inject(AuthService);

  @Input({ required: true }) auctionId!: string;

  readonly page = signal(1);
  readonly limit = signal(20);
  readonly bids = computed(() => this._bidState.bids());
  readonly userId = computed(() => this._auth.currentUser()?.id ?? null);

  ngOnInit(): void {
    this.load();
  }

  nextPage(): void {
    this.page.update((value) => value + 1);
    this.load();
  }

  prevPage(): void {
    this.page.update((value) => Math.max(1, value - 1));
    this.load();
  }

  isOwnBid(bid: Bid): boolean {
    return !!this.userId() && bid.bidderId === this.userId();
  }

  trackByBid(index: number, bid: Bid): string {
    return bid.id ?? String(index);
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }

  private load(): void {
    this._bidState.loadBidHistory(this.auctionId, this.page(), this.limit()).subscribe();
  }
}
