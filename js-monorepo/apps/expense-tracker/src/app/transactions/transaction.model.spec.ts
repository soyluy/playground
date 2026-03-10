import { TRANSACTION_CATEGORIES } from './transaction.model';

describe('TRANSACTION_CATEGORIES', () => {
  it('has categories for income and expense', () => {
    expect(Object.keys(TRANSACTION_CATEGORIES)).toEqual(['income', 'expense']);
  });

  it('includes "Salary" as an income category', () => {
    expect(TRANSACTION_CATEGORIES.income).toContain('Salary');
  });

  it('includes "Food" as an expense category', () => {
    expect(TRANSACTION_CATEGORIES.expense).toContain('Food');
  });
});
