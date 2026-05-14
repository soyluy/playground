import { Injectable, computed, signal } from '@angular/core';
import { tap } from 'rxjs';

import { User } from '../../../core/models/user.model';
import { Transaction } from '../../../core/models/transaction.model';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private readonly _profile = signal<User | null>(null);
  private readonly _balance = signal<number>(0);
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _refresh = signal<number>(0);

  readonly profile = computed(() => this._profile());
  readonly balance = computed(() => this._balance());
  readonly transactions = computed(() => this._transactions());
  readonly loading = computed(() => this._loading());

  constructor(private readonly _userApiService: UserApiService) {}

  loadProfile() {
    this._loading.set(true);
    return this._userApiService.getProfile().pipe(
      tap((profile) => {
        this._profile.set(profile);
        this._balance.set(profile.balance);
        this._loading.set(false);
      }),
    );
  }

  loadBalance() {
    return this._userApiService.getBalance().pipe(
      tap((result) => {
        this._balance.set(result.balance);
      }),
    );
  }

  updateProfile(payload: Partial<User>) {
    return this._userApiService.updateProfile(payload).pipe(
      tap((profile) => {
        this._profile.set(profile);
      }),
    );
  }

  deposit(payload: { amount: number; reference: string; description?: string }) {
    const previous = this._balance();
    this._balance.set(previous + payload.amount);

    return this._userApiService.deposit(payload).pipe(
      tap((result) => {
        this._balance.set(result.balance);
        this.refresh();
      }),
    );
  }

  withdraw(payload: { amount: number; reference: string; description?: string }) {
    const previous = this._balance();
    this._balance.set(Math.max(0, previous - payload.amount));

    return this._userApiService.withdraw(payload).pipe(
      tap((result) => {
        this._balance.set(result.balance);
        this.refresh();
      }),
    );
  }

  loadTransactions(limit: number = 20, offset: number = 0) {
    return this._userApiService.getTransactions({ limit, offset }).pipe(
      tap((response) => {
        this._transactions.set(response.data ?? []);
      }),
    );
  }

  refresh(): void {
    this._refresh.update((value) => value + 1);
  }
}
