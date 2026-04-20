import { TransactionType } from '../interfaces/transaction.interface';
import { Transaction } from '../interfaces';

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export type CreateTransactionResponse = Transaction;
