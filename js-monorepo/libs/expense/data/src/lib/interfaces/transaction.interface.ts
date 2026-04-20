export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
}
