import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Transaction, UpdateTransactionDto } from '@hub/expense-data';
import { ENVIRONMENT } from '@hub/ui-infra';
import { firstValueFrom } from 'rxjs';
import { ExpensePersistenceStrategy } from '../expense-persistence.strategy';

@Injectable({ providedIn: 'root' })
export class ServerExpensePersistenceStrategy
  implements ExpensePersistenceStrategy
{
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;
  private readonly _basePath = `${this._apiUrl}/expense`;

  async loadTransactions(): Promise<Transaction[]> {
    return await firstValueFrom(this._http.get<Transaction[]>(this._basePath));
  }

  async addTransaction(
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return await firstValueFrom(
      this._http.post<Transaction>(this._basePath, transaction),
    );
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    const dto: UpdateTransactionDto = {
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    };
    return await firstValueFrom(
      this._http.put<Transaction>(`${this._basePath}/${transaction.id}`, dto),
    );
  }

  async deleteTransaction(id: number): Promise<void> {
    await firstValueFrom(
      this._http.delete<Transaction>(`${this._basePath}/${id}`),
    );
  }
}
