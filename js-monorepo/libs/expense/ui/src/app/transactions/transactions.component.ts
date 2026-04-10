import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';

@Component({
  selector: 'expense-transactions',
  standalone: true,
  imports: [
    DashboardComponent,
    TransactionFormComponent,
    TransactionListComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {}
