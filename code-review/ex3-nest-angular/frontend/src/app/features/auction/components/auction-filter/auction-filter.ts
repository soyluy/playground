import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuctionStatus, AuctionType } from '../../../../core/models/auction.model';

type FilterFormValue = {
  type: AuctionType | '';
  status: AuctionStatus | '';
  categorySlug: string;
  priceMin: number | null;
  priceMax: number | null;
  endingIn: number | null;
};

@Component({
  selector: 'app-auction-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './auction-filter.html',
  styleUrl: './auction-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionFilterComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogRef = inject(MatDialogRef<AuctionFilterComponent>);

  readonly typeOptions = Object.values(AuctionType);
  readonly statusOptions = Object.values(AuctionStatus);

  readonly form = this._fb.group({
    type: this._fb.control<AuctionType | ''>(''),
    status: this._fb.control<AuctionStatus | ''>(''),
    categorySlug: this._fb.control<string>(''),
    priceMin: this._fb.control<number | null>(null),
    priceMax: this._fb.control<number | null>(null),
    endingIn: this._fb.control<number | null>(null),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: Partial<FilterFormValue> | null) {
    this.reset();
  }

  apply(): void {
    const value = this.form.getRawValue();
    this._dialogRef.close({
      type: value.type || undefined,
      status: value.status || undefined,
      categorySlug: value.categorySlug || undefined,
      minPrice: value.priceMin ?? undefined,
      maxPrice: value.priceMax ?? undefined,
      endingIn: value.endingIn ?? undefined,
    });
  }

  reset(): void {
    this.form.reset({
      type: '',
      status: '',
      categorySlug: '',
      priceMin: null,
      priceMax: null,
      endingIn: null,
    });
  }

  close(): void {
    this._dialogRef.close();
  }
}
