import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { map, tap } from 'rxjs';

import { AuctionType } from '../../../../core/models/auction.model';
import { AuctionApiService } from '../../services/auction-api.service';
import { AuctionItemApiService } from '../../../auction-item/services/auction-item-api.service';

@Component({
  selector: 'app-create-auction-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
  ],
  templateUrl: './create-auction.html',
  styleUrl: './create-auction.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAuctionPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _auctionApi = inject(AuctionApiService);
  private readonly _itemApi = inject(AuctionItemApiService);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<Array<{ id: string; title: string }>>([]);
  readonly types = Object.values(AuctionType);

  readonly form = this._fb.group({
    itemId: this._fb.control('', Validators.required),
    type: this._fb.control<AuctionType>(AuctionType.ENGLISH, Validators.required),
    startTime: this._fb.control<Date | null>(new Date(), Validators.required),
    endTime: this._fb.control<Date | null>(null, Validators.required),
    startingPrice: this._fb.control<number | null>(null),
    reservePrice: this._fb.control<number | null>(null),
    buyNowPrice: this._fb.control<number | null>(null),
    bidIncrement: this._fb.control<number | null>(1, Validators.required),
    extensionMinutes: this._fb.control<number | null>(2),
    extensionThresholdSeconds: this._fb.control<number | null>(60),
  });

  readonly selectedType = computed(() => this.form.controls.type.value);
  readonly showReserve = computed(
    () => this.selectedType() === AuctionType.RESERVE || this.selectedType() === AuctionType.ENGLISH,
  );
  readonly showBuyNow = computed(
    () => this.selectedType() === AuctionType.BUY_NOW || this.selectedType() === AuctionType.ENGLISH,
  );
  readonly isDutch = computed(() => this.selectedType() === AuctionType.DUTCH);

  constructor() {
    this._itemApi
      .getUserItems(100, 0)
      .pipe(
        map((response) => response.data ?? []),
        tap((items) => {
          this.items.set(
            items.map((item) => ({
              id: item.id,
              title: item.title,
            })),
          );
        }),
      )
      .subscribe();

    const itemIdFromQuery = this._route.snapshot.queryParamMap.get('itemId');
    if (itemIdFromQuery) {
      this.form.controls.itemId.setValue(itemIdFromQuery);
    }

    this.form.controls.type.valueChanges.subscribe((type) => {
      const current = this.form.getRawValue();
      this.form.setValue({
        ...current,
        type: type ?? AuctionType.ENGLISH,
      });
    });
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      itemId: value.itemId ?? '',
      type: value.type ?? AuctionType.ENGLISH,
      startTime: value.startTime?.toISOString() ?? new Date().toISOString(),
      endTime: value.endTime?.toISOString() ?? new Date().toISOString(),
      startingPrice: Number(value.startingPrice ?? 0),
      reservePrice: value.reservePrice,
      buyNowPrice: value.buyNowPrice,
      bidIncrement: value.bidIncrement ?? 1,
      extensionMinutes: value.extensionMinutes ?? 2,
      extensionThresholdSeconds: value.extensionThresholdSeconds ?? 60,
    };

    this._auctionApi.createAuction(payload).subscribe({
      next: (auction) => {
        this.saving.set(false);
        this._router.navigate(['/auctions', auction.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err instanceof Error ? err.message : 'Failed to create auction');
      },
    });
  }
}
