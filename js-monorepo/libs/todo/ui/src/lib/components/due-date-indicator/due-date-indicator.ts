import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TODO_DUE_DATE_TOOLTIP_SHOW_DELAY_MS } from '../../constants/ui.constants';

type DueDateValue = Date | string | null;

@Component({
  selector: 'todo-due-date-indicator',
  imports: [MatTooltipModule],
  templateUrl: './due-date-indicator.html',
  styleUrls: ['./due-date-indicator.scss'],
})
export class DueDateIndicatorComponent {
  readonly dueDate = input<DueDateValue>(null);
  protected readonly tooltipShowDelayMs = TODO_DUE_DATE_TOOLTIP_SHOW_DELAY_MS;

  protected readonly displayDate = computed(() => {
    const dueDate = this.toDate(this.dueDate());
    if (!dueDate) {
      return 'No due date';
    }
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dueDate);
  });

  protected readonly tooltipText = computed(() => {
    const dueDate = this.toDate(this.dueDate());
    if (!dueDate) {
      return 'Due date is unavailable';
    }

    const deltaMs = dueDate.getTime() - Date.now();
    const duration = this.formatDuration(Math.abs(deltaMs));
    if (deltaMs < 0) {
      return `Overdue by ${duration}`;
    }

    return `${duration} left to complete`;
  });

  private toDate(inputDate: DueDateValue): Date | null {
    if (!inputDate) {
      return null;
    }
    const output = inputDate instanceof Date ? inputDate : new Date(inputDate);
    if (Number.isNaN(output.getTime())) {
      return null;
    }
    return output;
  }

  private formatDuration(milliseconds: number): string {
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (milliseconds < minute) {
      return 'less than a minute';
    }

    if (milliseconds < hour) {
      const minutes = Math.floor(milliseconds / minute);
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    if (milliseconds < day) {
      const hours = Math.floor(milliseconds / hour);
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    const days = Math.floor(milliseconds / day);
    return `${days} day${days === 1 ? '' : 's'}`;
  }
}
