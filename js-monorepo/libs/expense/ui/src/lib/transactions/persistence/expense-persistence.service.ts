import { computed, inject, Injectable, Signal } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import { LocalExpensePersistenceStrategy } from './strategies/local-expense-persistence.strategy';
import { ServerExpensePersistenceStrategy } from './strategies/server-expense-persistence.strategy';
import { AuthService } from '@hub/auth-ui';
import { User } from '@hub/user-api';
import { ExpensePersistenceStrategy } from './expense-persistence.strategy';

@Injectable({ providedIn: 'root' })
export class ExpensePersistenceService {
  private readonly _localStrategy = inject(LocalExpensePersistenceStrategy);
  private readonly _serverStrategy = inject(ServerExpensePersistenceStrategy);
  private readonly _user = inject(AuthService).user;

  private readonly _strategy: Signal<ExpensePersistenceStrategy> = computed(
    () => {
      const user = this._user();
      return this.getStrategy(user);
    },
  );

  async loadTransactions(): Promise<Transaction[]> {
    return await this._strategy().loadTransactions();
  }

  async addTransaction(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return await this._strategy().addTransaction(transaction);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this._strategy().deleteTransaction(id);
  }

  private getStrategy(user: User | null): ExpensePersistenceStrategy {
    return user ? this._serverStrategy : this._localStrategy;
  }
}
