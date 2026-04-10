import { Component } from '@angular/core';
import { TransactionsComponent } from './transactions/transactions.component';

@Component({
  selector: 'expense-tracker-root',
  standalone: true,
  imports: [TransactionsComponent],
  templateUrl: './expense-tracker.html',
  styleUrl: './expense-tracker.scss',
})
export class ExpenseTracker {
  protected title = 'expense-tracker';
}
