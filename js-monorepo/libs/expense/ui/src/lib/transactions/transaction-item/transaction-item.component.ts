import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Transaction } from '@hub/expense-data';

@Component({
  selector: 'expense-tracker-transaction-item',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './transaction-item.component.html',
  styleUrl: './transaction-item.component.scss',
})
export class TransactionItemComponent {
  readonly transaction = input.required<Transaction>();
  readonly deleted = output<number>();

  protected onDelete(): void {
    this.deleted.emit(this.transaction().id);
  }
}
