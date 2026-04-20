import { inject, Injectable } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import {
  EXPENSE_PERSISTENCE_MODE,
  ExpensePersistenceMode,
} from './expense-persistence.types';
import { ExpensePersistenceStrategy } from './expense-persistence.strategy';
import { LocalExpensePersistenceStrategy } from './local-expense-persistence.strategy';
import { ServerExpensePersistenceStrategy } from './server-expense-persistence.strategy';

@Injectable({ providedIn: 'root' })
export class ExpensePersistenceFacade {
  private readonly _mode = inject(EXPENSE_PERSISTENCE_MODE);
  private readonly _localStrategy = inject(LocalExpensePersistenceStrategy);
  private readonly _serverStrategy = inject(ServerExpensePersistenceStrategy);

  async loadTransactions(): Promise<Transaction[]> {
    return await this.strategy.loadTransactions();
  }

  async addTransaction(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return await this.strategy.addTransaction(transaction);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.strategy.deleteTransaction(id);
  }

  private get strategy(): ExpensePersistenceStrategy {
    return this.getStrategy(this._mode);
  }

  private getStrategy(mode: ExpensePersistenceMode): ExpensePersistenceStrategy {
    if (mode === 'server') {
      return this._serverStrategy;
    }
    return this._localStrategy;
  }
}
