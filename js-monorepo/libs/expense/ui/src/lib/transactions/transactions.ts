import { Component, inject } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { AuthService } from '@hub/auth-ui';

@Component({
  selector: 'expense-transactions',
  standalone: true,
  imports: [
    DashboardComponent,
    TransactionFormComponent,
    TransactionListComponent,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsComponent {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected onDebug(): void {
    console.log('onDebug', this.user());
  }
}
