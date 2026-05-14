import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { Auction } from '../../../../core/models/auction.model';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-auction-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './auction-management.html',
  styleUrl: './auction-management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionManagementPage {
  private readonly _adminApi = inject(AdminApiService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);

  readonly auctions = signal<Auction[]>([]);
  readonly loading = signal(false);
  readonly selectedIds = signal<string[]>([]);

  readonly filtersForm = this._fb.group({
    status: this._fb.control<string>(''),
    fromDate: this._fb.control<Date | null>(null),
    toDate: this._fb.control<Date | null>(null),
  });

  readonly filteredAuctions = computed(() => {
    const status = this.filtersForm.controls.status.value;
    const from = this.filtersForm.controls.fromDate.value;
    const to = this.filtersForm.controls.toDate.value;

    return this.auctions().filter((auction) => {
      if (status && auction.status !== status) {
        return false;
      }
      const createdAt = new Date(auction.createdAt);
      if (from && createdAt < from) {
        return false;
      }
      if (to && createdAt > to) {
        return false;
      }
      return true;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this._adminApi.getAuctions().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.auctions.set(response);
        } else {
          this.auctions.set(response.data ?? []);
        }
      },
      complete: () => this.loading.set(false),
    });
  }

  toggleSelection(auctionId: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(auctionId) ? ids.filter((id) => id !== auctionId) : [...ids, auctionId],
    );
  }

  isSelected(auctionId: string): boolean {
    return this.selectedIds().includes(auctionId);
  }

  forceEnd(auctionId: string): void {
    this._adminApi.forceEndAuction(auctionId).subscribe(() => this.load());
  }

  cancel(auctionId: string): void {
    this._adminApi.forceEndAuction(auctionId).subscribe(() => this.load());
  }

  viewDetail(auctionId: string): void {
    this._router.navigate(['/auctions', auctionId]);
  }

  bulkCancel(): void {
    const ids = this.selectedIds();
    ids.forEach((id) => this.cancel(id));
    this.selectedIds.set([]);
  }

  bulkForceEnd(): void {
    const ids = this.selectedIds();
    ids.forEach((id) => this.forceEnd(id));
    this.selectedIds.set([]);
  }
}
