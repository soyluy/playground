import { Transaction } from '@hub/expense-data';

export interface ExpensePersistenceStrategy {
  loadTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(transaction: Transaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
}
