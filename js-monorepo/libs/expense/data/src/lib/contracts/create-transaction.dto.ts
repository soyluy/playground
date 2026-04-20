import { TransactionType } from '../interfaces/transaction.interface';

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}
