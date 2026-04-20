import { inject, Injectable } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import { ExpensePersistenceMode } from './expense-persistence.types';
import { ExpensePersistenceStrategy } from './expense-persistence.strategy';
import { LocalExpensePersistenceStrategy } from './local-expense-persistence.strategy';
import { ServerExpensePersistenceStrategy } from './server-expense-persistence.strategy';
import { ExpensePersistenceConfigService } from './expense-persistence-config.service';

@Injectable({ providedIn: 'root' })
export class ExpensePersistenceFacade {
  private readonly _configService = inject(ExpensePersistenceConfigService);
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

  getMode(): ExpensePersistenceMode {
    return this._configService.getMode();
  }

  setMode(mode: ExpensePersistenceMode): void {
    this._configService.setMode(mode);
  }

  private get strategy(): ExpensePersistenceStrategy {
    return this.getStrategy(this._configService.mode());
  }

  private getStrategy(mode: ExpensePersistenceMode): ExpensePersistenceStrategy {
    if (mode === 'server') {
      return this._serverStrategy;
    }
    return this._localStrategy;
  }
}
