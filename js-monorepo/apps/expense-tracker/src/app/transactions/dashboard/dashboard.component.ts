import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../transaction.service';
import { environment } from '@env';

@Component({
  selector: 'expense-tracker-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly txService = inject(TransactionService);
  protected readonly currency = environment.currency;
  protected readonly currencySymbol = environment.currencySymbol;
  protected readonly currencyDecimalPlaces = `1.${environment.currencyDecimalPlaces}-${environment.currencyDecimalPlaces}`;
}
