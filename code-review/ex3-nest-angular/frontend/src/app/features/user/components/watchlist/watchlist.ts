import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { map } from 'rxjs';

import { formatCurrency, formatTimeRemaining } from '../../../../core/utils/format.utils';
import { SocketService } from '../../../../core/services/socket.service';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './watchlist.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent {
  private readonly _userApi = inject(UserApiService);
  private readonly _router = inject(Router);
  private readonly _socket = inject(SocketService);

  readonly auctions = signal<any[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this._socket.connect('auction');
    this._userApi
      .getWatchlist()
      .pipe(
        map((rows) => rows ?? []),
      )
      .subscribe((rows) => {
        this.auctions.set(rows);
        this.loading.set(false);
        rows.forEach((auction) => {
          this._socket.joinAuction(auction.id);
        });
      });
  }

  remove(auctionId: string): void {
    this._socket.emit('unwatchAuction', { auctionId });
    this.auctions.update((current) => current.filter((auction) => auction.id !== auctionId));
  }

  openAuction(auctionId: string): void {
    this._router.navigate(['/auctions', auctionId]);
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }

  toTime(endTime: string): string {
    return formatTimeRemaining(endTime);
  }
}
