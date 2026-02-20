import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TRANSACTION_CATEGORIES, TransactionType } from '../transaction.model';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'expense-tracker-transaction-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent {
  private readonly txService = inject(TransactionService);

  protected readonly categories = TRANSACTION_CATEGORIES;
  protected readonly isOpen = signal(false);

  protected type: TransactionType = 'expense';
  protected description = '';
  protected amount: number | null = null;
  protected category = this.categories['expense'][0];
  protected date = new Date().toISOString().split('T')[0];

  protected get currentCategories(): string[] {
    return this.categories[this.type];
  }

  protected onTypeChange(): void {
    this.category = this.currentCategories[0];
  }

  protected toggle(): void {
    this.isOpen.update((v) => !v);
  }

  protected submit(): void {
    if (!this.description.trim() || !this.amount || this.amount <= 0) return;

    this.txService.addTransaction({
      description: this.description.trim(),
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: this.date,
    });

    this.reset();
    this.isOpen.set(false);
  }

  private reset(): void {
    this.description = '';
    this.amount = null;
    this.type = 'expense';
    this.category = this.categories['expense'][0];
    this.date = new Date().toISOString().split('T')[0];
  }
}
