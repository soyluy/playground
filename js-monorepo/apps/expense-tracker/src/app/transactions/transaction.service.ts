import { Injectable, computed, signal } from '@angular/core';
import { Transaction } from './transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  // TODO: On init, load transactions from idb instead of starting with empty array
  // TODO: On each mutation, sync to idb
  private readonly _transactions = signal<Transaction[]>([]);

  readonly transactions = this._transactions.asReadonly();

  readonly totalIncome = computed(() =>
    this._transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly totalExpenses = computed(() =>
    this._transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpenses());

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const entry: Transaction = { ...transaction, id: crypto.randomUUID() };
    this._transactions.update(txns => [entry, ...txns]);
  }

  deleteTransaction(id: string): void {
    this._transactions.update(txns => txns.filter(t => t.id !== id));
  }
}
