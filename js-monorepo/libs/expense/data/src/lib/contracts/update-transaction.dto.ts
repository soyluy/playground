import { TransactionType } from '../interfaces';
import { Transaction } from '../interfaces';

export interface UpdateTransactionDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
}

export type UpdateTransactionResponse = Transaction;
