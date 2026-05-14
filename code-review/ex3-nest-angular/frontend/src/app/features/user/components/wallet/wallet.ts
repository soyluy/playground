import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { formatCurrency } from '../../../../core/utils/format.utils';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _userState = inject(UserStateService);

  readonly balance = this._userState.balance;
  readonly transactions = this._userState.transactions;
  readonly pendingHolds = signal<number>(0);

  readonly depositForm = this._fb.group({
    amount: this._fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    reference: this._fb.control('', Validators.required),
    description: this._fb.control(''),
  });

  readonly withdrawForm = this._fb.group({
    amount: this._fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    reference: this._fb.control('', Validators.required),
    description: this._fb.control(''),
  });

  ngOnInit(): void {
    this._userState.loadBalance().subscribe();
    this._userState.loadTransactions().subscribe();
  }

  deposit(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    this._userState.deposit(this.depositForm.getRawValue() as never).subscribe();
    this.depositForm.reset({ amount: null, reference: '', description: '' });
  }

  withdraw(): void {
    if (this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }

    this._userState.withdraw(this.withdrawForm.getRawValue() as never).subscribe();
    this.withdrawForm.reset({ amount: null, reference: '', description: '' });
  }

  toCurrency(value: number): string {
    return formatCurrency(value);
  }
}
