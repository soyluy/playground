import { TransactionType } from '../interfaces/transaction.interface';

export const TRANSACTION_CATEGORIES: Record<TransactionType, string[]> = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: [
    'Food',
    'Transport',
    'Housing',
    'Health',
    'Entertainment',
    'Shopping',
    'Other',
  ],
};
