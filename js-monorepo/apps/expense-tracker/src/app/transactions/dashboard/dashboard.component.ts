import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'expense-tracker-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly txService = inject(TransactionService);
}
