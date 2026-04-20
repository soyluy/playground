export type TransactionType = 'income' | 'expense';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
}
