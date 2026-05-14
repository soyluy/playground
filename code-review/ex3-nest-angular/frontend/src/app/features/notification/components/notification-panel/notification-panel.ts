import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../../../core/services/socket.service';
import { SOCKET_EVENTS } from '../../../../core/constants/socket.constants';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPanelComponent {
  private readonly _notificationService = inject(NotificationService);
  private readonly _socketService = inject(SocketService);

  private _socketSub: Subscription | null = null;

  readonly notifications = this._notificationService.notifications;
  readonly unreadCount = this._notificationService.unreadCount;
  readonly isOpen = signal(false);
  readonly hasNotifications = computed(() => this.notifications().length > 0);

  open(): void {
    this.isOpen.set(true);
    this._notificationService.openPanel();
    this._notificationService.loadNotifications().subscribe();

    this._socketSub = this._socketService
      .on(SOCKET_EVENTS.NEW_NOTIFICATION)
      .subscribe(() => {
        this._notificationService.loadNotifications().subscribe();
      });
  }

  close(): void {
    this.isOpen.set(false);
    this._notificationService.closePanel();
  }

  markAsRead(notificationId: string): void {
    (this._notificationService as any)._notifications.update((items: any[]) =>
      items.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
    (this._notificationService as any)._unreadCount.set(
      this.notifications().filter((item) => !item.isRead).length,
    );

    this._notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead(): void {
    (this._notificationService as any)._notifications.update((items: any[]) =>
      items.map((item) => ({ ...item, isRead: true })),
    );
    (this._notificationService as any)._unreadCount.set(0);

    this._notificationService.markAllAsRead().subscribe();
  }

  trackById(index: number, item: { id: string }): string {
    return item.id ?? String(index);
  }
}
