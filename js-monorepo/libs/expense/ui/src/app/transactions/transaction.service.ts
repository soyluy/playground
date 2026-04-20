import { Injectable, computed, inject, signal } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import { DbWrapperService, ENVIRONMENT } from '@hub/ui-infra';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly _db = inject(DbWrapperService);
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _storeKey = inject(ENVIRONMENT).expensesObjStoreName;

  constructor() {
    this.loadTransactions();
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

  loadTransactions() {
    this._db.bulkReadFromStore<Transaction>(this._storeKey, (data) => {
      this._transactions.set(data);
    });
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const entry: Transaction = { ...transaction, id: crypto.randomUUID() };
    this._transactions.update((txns) => [entry, ...txns]);
    this._db.writeToStore(this._storeKey, [entry]);
  }

  deleteTransaction(id: string): void {
    this._transactions.update((txns) => txns.filter((t) => t.id !== id));
    this._db.deleteFromStore(this._storeKey, id);
  }
}
