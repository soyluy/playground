import { inject, Injectable } from '@angular/core';
import { Transaction } from '@hub/expense-data';
import { DbWrapperService, ENVIRONMENT } from '@hub/ui-infra';
import { ExpensePersistenceStrategy } from '../expense-persistence.strategy';

@Injectable({ providedIn: 'root' })
export class LocalExpensePersistenceStrategy
  implements ExpensePersistenceStrategy
{
  private readonly _db = inject(DbWrapperService);
  private readonly _storeKey = inject(ENVIRONMENT).expensesObjStoreName;

  async loadTransactions(): Promise<Transaction[]> {
    return await new Promise<Transaction[]>((resolve) => {
      void this._db.bulkReadFromStore<Transaction>(this._storeKey, (data) => {
        resolve(data);
      });
    });
  }

  async addTransaction(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    const entry: Transaction = { ...transaction, id: Date.now() };
    await this._db.writeToStore(this._storeKey, [entry]);
    return entry;
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    await this._db.deleteFromStore(
      this._storeKey,
      transaction.id.toString() as unknown as string,
    );
    return await this.addTransaction(transaction);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this._db.deleteFromStore(this._storeKey, id as unknown as string);
  }
}
