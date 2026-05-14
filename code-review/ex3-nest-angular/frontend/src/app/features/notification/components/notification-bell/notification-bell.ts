import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatBadgeModule, MatButtonModule, MatIconModule],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent {
  private readonly _notificationService = inject(NotificationService);

  readonly unreadCount = this._notificationService.unreadCount;
  readonly pulse = signal(false);
  readonly isOpen = this._notificationService.isPanelOpen;
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  ngOnInit(): void {
    this._notificationService.loadNotifications().subscribe();

    effect(() => {
      if (!this.hasUnread()) {
        return;
      }
      this.pulse.set(true);
      setTimeout(() => this.pulse.set(false), 900);
    });
  }

  togglePanel(): void {
    this._notificationService.togglePanel();
  }
}
