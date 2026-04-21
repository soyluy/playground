import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import { ExpenseStrategyService } from './persistence';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly _strategyService = inject(ExpenseStrategyService);
  private readonly _transactions = signal<Transaction[]>([]);

  constructor() {
    effect(() => {
      this._strategyService.strategy(); // track strategy changes
      void this.loadTransactions();
    });
  }

  readonly transactions = this._transactions.asReadonly();

  readonly totalIncome = computed(() =>
    this._transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly totalExpenses = computed(() =>
    this._transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpenses());

  async loadTransactions(): Promise<void> {
    try {
      const data = await this._strategyService.strategy().loadTransactions();
      this._transactions.set(data);
    } catch (error) {
      console.error('Failed to load transactions', error);
    }
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    void this.persistTransaction(transaction);
  }

  deleteTransaction(id: number): void {
    void this.removeTransaction(id);
  }

  private async persistTransaction(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<void> {
    try {
      const entry = await this._strategyService
        .strategy()
        .addTransaction(transaction);
      this._transactions.update((txns) => [entry, ...txns]);
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  }

  private async removeTransaction(id: number): Promise<void> {
    try {
      await this._strategyService.strategy().deleteTransaction(id);
      this._transactions.update((txns) => txns.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  }
}
