import { Component } from '@angular/core';
import { TransactionsComponent } from './transactions/transactions';

@Component({
  selector: 'expense-tracker',
  standalone: true,
  imports: [TransactionsComponent],
  templateUrl: './expense-tracker.html',
  styleUrl: './expense-tracker.scss',
})
export class ExpenseTracker {
  protected title = 'Expense Tracker';
}
