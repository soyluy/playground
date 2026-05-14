import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, computed, signal } from '@angular/core';
import { Subscription, tap } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../../../core/constants/api.constants';
import { SOCKET_EVENTS } from '../../../core/constants/socket.constants';
import { Notification } from '../../../core/models/notification.model';
import { SocketService } from '../../../core/services/socket.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  private readonly _unreadCount = signal<number>(1);
  private readonly _isPanelOpen = signal<boolean>(false);
  private readonly _socketSub: Subscription;

  readonly notifications = computed(() => this._notifications());
  readonly unreadCount = computed(() => this._unreadCount());
  readonly isPanelOpen = computed(() => this._isPanelOpen());

  constructor(
    private readonly _http: HttpClient,
    private readonly _socketService: SocketService,
    @Inject(API_BASE_URL) private readonly _apiBaseUrl: string,
  ) {
    this._socketService.connect('notification');
    this._socketSub = this._socketService
      .on<Notification>(SOCKET_EVENTS.NEW_NOTIFICATION)
      .subscribe((notification) => {
        this._notifications.update((current) => [notification, ...current]);
        this._unreadCount.update((count) => count + 1);
      });
  }

  loadNotifications(limit: number = 50) {
    return this._http
      .get<Notification[]>(`${this._apiBaseUrl}${API_ENDPOINTS.users.notifications}`, {
        params: { limit } as never,
      })
      .pipe(
        tap((items) => {
          this._notifications.set(items ?? []);
          this._unreadCount.set(items.filter((item) => !item.isRead).length);
        }),
      );
  }

  markAsRead(notificationId: string) {
    return this._http
      .post<{ success: boolean }>(
        `${this._apiBaseUrl}${API_ENDPOINTS.users.notifications}/${notificationId}/read`,
        {},
      )
      .pipe(
        tap(() => {
          this._notifications.update((current) =>
            current.map((item) =>
              item.id === notificationId ? { ...item, isRead: true } : item,
            ),
          );
          this._unreadCount.set(this._notifications().filter((item) => !item.isRead).length);
        }),
      );
  }

  markAllAsRead() {
    return this._http
      .post<{ success: boolean }>(
        `${this._apiBaseUrl}${API_ENDPOINTS.users.notifications}/read-all`,
        {},
      )
      .pipe(
        tap(() => {
          this._notifications.update((current) =>
            current.map((item) => ({ ...item, isRead: true })),
          );
          this._unreadCount.set(0);
        }),
      );
  }

  openPanel(): void {
    this._isPanelOpen.set(true);
  }

  closePanel(): void {
    this._isPanelOpen.set(false);
  }

  togglePanel(): void {
    this._isPanelOpen.update((value) => !value);
  }
}
