import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuctionStateService } from '../../services/auction-state.service';
import { AuctionFilterComponent } from '../auction-filter/auction-filter';
import { AuctionCardComponent } from '../auction-card/auction-card';
import { AuctionStatus, AuctionType } from '../../../../core/models/auction.model';

type FilterValue = {
  type?: AuctionType;
  status?: AuctionStatus;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
};

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuctionCardComponent,
  ],
  templateUrl: './auction-list.html',
  styleUrl: './auction-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionListComponent {
  private readonly _auctionState = inject(AuctionStateService);
  private readonly _dialog = inject(MatDialog);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly activeFilter = signal<FilterValue>({});

  readonly auctions = this._auctionState.auctions;
  readonly loading = this._auctionState.loading;
  readonly error = this._auctionState.error;
  readonly total = this._auctionState.total;
  readonly pagination = this._auctionState.pagination;

  readonly hasResults = computed(() => this.auctions().length > 0);

  constructor() {
    toObservable(
      computed(() => this.searchControl.value.trim()),
    )
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query) => {
        this._auctionState.setFilters({
          ...this.activeFilter(),
          q: query || undefined,
        });
      });
  }

  openFilters(): void {
    const ref = this._dialog.open(AuctionFilterComponent, {
      width: '420px',
      data: this.activeFilter(),
    });

    ref.afterClosed().subscribe((result: FilterValue | undefined) => {
      if (!result) {
        return;
      }

      this.activeFilter.set(result);
      this._auctionState.setFilters({
        ...result,
        q: this.searchControl.value.trim() || undefined,
      });
    });
  }

  resetSearch(): void {
    this.searchControl.setValue('');
  }

  nextPage(): void {
    this._auctionState.nextPage();
  }

  prevPage(): void {
    this._auctionState.prevPage();
  }

  refresh(): void {
    this._auctionState.refresh();
  }
}
