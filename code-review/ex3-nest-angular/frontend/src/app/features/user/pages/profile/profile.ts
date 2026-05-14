import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { AuctionStateService } from '../../../auction/services/auction-state.service';
import { BidStateService } from '../../../bid/services/bid-state.service';
import { NotificationService } from '../../../notification/services/notification.service';
import { UserStateService } from '../../services/user-state.service';
import { WalletComponent } from '../../components/wallet/wallet';
import { WatchlistComponent } from '../../components/watchlist/watchlist';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, MatTabsModule, WalletComponent, WatchlistComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly _userState = inject(UserStateService);
  private readonly _auctionState = inject(AuctionStateService);
  private readonly _bidState = inject(BidStateService);
  private readonly _notificationState = inject(NotificationService);

  readonly profile = this._userState.profile;
  readonly balance = this._userState.balance;
  readonly transactions = this._userState.transactions;
  readonly myAuctions = this._auctionState.auctions;
  readonly myBids = this._bidState.bids;
  readonly notifications = this._notificationState.notifications;

  readonly fullName = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return '';
    }

    return `${profile.firstName} ${profile.lastName}`;
  });

  ngOnInit(): void {
    this._userState.loadProfile().subscribe();
    this._userState.loadTransactions().subscribe();
    this._auctionState.setFilters({ sellerId: this.profile()?.id });
  }
}
