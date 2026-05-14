import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="countdown-badge" [class.compact]="compact" [class.warning]="tone() === 'warning'" [class.danger]="tone() === 'danger'">
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .countdown-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        background: #e0f2fe;
        color: #0c4a6e;
        font-size: 12px;
        font-weight: 600;
      }

      .countdown-badge.compact {
        font-size: 11px;
        padding: 1px 7px;
      }

      .countdown-badge.warning {
        background: #fef3c7;
        color: #92400e;
      }

      .countdown-badge.danger {
        background: #fee2e2;
        color: #991b1b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownBadgeComponent {
  @Input({ required: true }) endTime!: string;
  @Input() compact = false;

  private readonly _remaining = signal(0);
  private _tick: Subscription | null = null;

  readonly tone = computed<'normal' | 'warning' | 'danger'>(() => {
    const remaining = this._remaining();
    if (remaining <= 60) {
      return 'danger';
    }
    if (remaining <= 300) {
      return 'warning';
    }
    return 'normal';
  });

  readonly label = computed(() => {
    const remaining = this._remaining();
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (this.compact) {
      return `${minutes}m ${seconds}s`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  });

  ngOnInit(): void {
    this.syncRemaining();
    this._tick = interval(1000).subscribe(() => {
      this.syncRemaining();
    });
  }

  private syncRemaining(): void {
    const end = new Date(this.endTime).getTime();
    const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
    this._remaining.set(remaining);
  }
}
