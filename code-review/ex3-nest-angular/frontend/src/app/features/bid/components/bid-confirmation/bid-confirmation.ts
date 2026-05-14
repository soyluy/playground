import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  computed,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { formatCurrency } from '../../../../core/utils/format.utils';

type BidConfirmationData = {
  amount: number;
  currentPrice: number;
};

@Component({
  selector: 'app-bid-confirmation',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './bid-confirmation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BidConfirmationComponent {
  readonly bidAmount = signal<number>(this.data.amount);
  readonly buyerPremium = signal<number>(
    Number((this.data.currentPrice * 0.1).toFixed(2)),
  );
  readonly totalCost = computed(() => this.bidAmount() + this.buyerPremium());

  constructor(
    private readonly _dialogRef: MatDialogRef<BidConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: BidConfirmationData,
  ) {}

  confirm(): void {
    this._dialogRef.close(true);
  }

  cancel(): void {
    this._dialogRef.close(false);
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }
}
