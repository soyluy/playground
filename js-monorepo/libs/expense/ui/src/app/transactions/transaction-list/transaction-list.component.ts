import { Component, computed, inject, signal } from '@angular/core';
import { TransactionItemComponent } from '../transaction-item/transaction-item.component';
import { TransactionService } from '../transaction.service';
import { TransactionType } from '../transaction.model';
import { CommonModule } from '@angular/common';
import { ENVIRONMENT } from '@hub/ui-infra';

type Filter = 'all' | TransactionType;

@Component({
  selector: 'expense-tracker-transaction-list',
  standalone: true,
  imports: [TransactionItemComponent, CommonModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent {
  protected readonly txService = inject(TransactionService);
  protected readonly isDev = !inject(ENVIRONMENT).production;
  protected readonly filters: Filter[] = ['all', 'income', 'expense'];
  protected readonly activeFilter = signal<Filter>('all');

  protected readonly filtered = computed(() => {
    const f = this.activeFilter();
    const txns = this.txService.transactions();
    return f === 'all' ? txns : txns.filter((t) => t.type === f);
  });

  protected setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
  }

  protected onDelete(id: string): void {
    this.txService.deleteTransaction(id);
  }

  protected onDebug(): void {
    console.log('[DEBUG]', this.txService.loadTransactions());
  }
}
