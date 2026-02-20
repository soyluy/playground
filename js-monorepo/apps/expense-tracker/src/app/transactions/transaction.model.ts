export type TransactionType = 'income' | 'expense';

export const TRANSACTION_CATEGORIES: Record<TransactionType, string[]> = {
  income:  ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Other'],
};

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
}
