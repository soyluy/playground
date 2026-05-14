import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { AuctionRealtimeService } from '../../../auction/services/auction-realtime.service';
import { formatCurrency } from '../../../../core/utils/format.utils';
import { BidStateService } from '../../services/bid-state.service';
import { BidConfirmationComponent } from '../bid-confirmation/bid-confirmation';

@Component({
  selector: 'app-bid-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './bid-panel.html',
  styleUrl: './bid-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BidPanelComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _bidState = inject(BidStateService);
  private readonly _auth = inject(AuthService);
  private readonly _dialog = inject(MatDialog);
  private readonly _auctionRealtime = inject(AuctionRealtimeService);

  @Input({ required: true }) auctionId!: string;
  @Input() startingPrice = 0;
  @Input() bidIncrement = 1;

  readonly isSubmitting = this._bidState.isSubmitting;
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly bidForm = this._fb.group({
    amount: this._fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
  });

  readonly autoBidForm = this._fb.group({
    enabled: this._fb.control(false, { nonNullable: true }),
    maxAmount: this._fb.control<number | null>(null),
  });

  readonly currentPrice = computed(
    () => this._auctionRealtime.currentPrice() || this.startingPrice,
  );
  readonly minimumBid = computed(() => this.currentPrice() + this.bidIncrement);
  readonly userBid = this._bidState.userBid;
  readonly bidStatus = computed(() => {
    const bid = this.userBid();
    if (!bid) {
      return 'No bid yet';
    }

    if (bid.isWinning) {
      return 'You are winning';
    }

    return 'You were outbid';
  });

  submitBid(): void {
    this.error.set(null);
    this.success.set(null);
    const amount = this.bidForm.controls.amount.value;
    const user = this._auth.currentUser();

    if (!amount || !user) {
      this.error.set('Enter a valid amount.');
      return;
    }

    const dialogRef = this._dialog.open(BidConfirmationComponent, {
      width: '380px',
      data: {
        amount,
        currentPrice: this.currentPrice(),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this._bidState
        .placeBid(this.auctionId, amount, user.id)
        .pipe(finalize(() => {}))
        .subscribe({
          next: () => {
            this.success.set('Bid submitted successfully.');
            this.bidForm.controls.amount.setValue(null);
          },
          error: (err) => {
            const message = err instanceof Error ? err.message : 'Bid submission failed.';
            this.error.set(message);
          },
        });
    });
  }

  saveAutoBid(): void {
    this.error.set(null);
    const maxAmount = this.autoBidForm.controls.maxAmount.value;
    if (!this.autoBidForm.controls.enabled.value) {
      this._bidState.cancelAutoBid(this.auctionId).subscribe();
      return;
    }

    if (!maxAmount) {
      this.error.set('Set max auto bid amount.');
      return;
    }

    this._bidState.setAutoBid(this.auctionId, maxAmount).subscribe({
      next: () => {
        this.success.set('Auto-bid updated.');
      },
      error: (err) => {
        const message = err instanceof Error ? err.message : 'Auto-bid failed.';
        this.error.set(message);
      },
    });
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }
}
