import { Currency, TransactionType } from '../interfaces';

export interface UpdateTransactionDto {
  description?: string;
  amount?: number;
  currency?: Currency;
  type?: TransactionType;
  category?: string;
  date?: string;
}
