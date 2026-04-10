import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'expense-tracker-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './expense-tracker.html',
  styleUrl: './expense-tracker.scss',
})
export class ExpenseTracker {
  protected title = 'expense-tracker';
}
