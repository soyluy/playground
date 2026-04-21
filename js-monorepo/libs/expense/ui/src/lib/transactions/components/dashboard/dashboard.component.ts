import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../transaction.service';
import { ENVIRONMENT } from '@hub/ui-infra';

@Component({
  selector: 'expense-tracker-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly txService = inject(TransactionService);
  protected readonly currency = inject(ENVIRONMENT).currency;
  protected readonly currencySymbol = inject(ENVIRONMENT).currencySymbol;
  protected readonly currencyDecimalPlaces = `1.${inject(ENVIRONMENT).currencyDecimalPlaces}-${inject(ENVIRONMENT).currencyDecimalPlaces}`;
}
