import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-auction-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-countdown.html',
  styleUrl: './auction-countdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionCountdownComponent {
  @Input({ required: true }) endTime!: string;
  @Input() extensionSeconds = 0;
  @Output() ended = new EventEmitter<void>();

  readonly days = signal<number>(0);
  readonly hours = signal<number>(0);
  readonly minutes = signal<number>(0);
  readonly seconds = signal<number>(0);

  readonly urgencyClass = computed(() => {
    const total = this.days() * 86400 + this.hours() * 3600 + this.minutes() * 60 + this.seconds();
    if (total <= 60) {
      return 'critical';
    }
    if (total <= 300) {
      return 'warning';
    }
    return 'normal';
  });

  ngOnInit(): void {
    this.updateCountdown();
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const endMs = new Date(this.endTime).getTime() + this.extensionSeconds * 1000;
    const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));

    const d = Math.floor(remaining / 86400);
    const h = Math.floor((remaining % 86400) / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;

    this.days.set(d);
    this.hours.set(h);
    this.minutes.set(m);
    this.seconds.set(s);

    if (remaining === 0) {
      this.ended.emit();
    }
  }
}
