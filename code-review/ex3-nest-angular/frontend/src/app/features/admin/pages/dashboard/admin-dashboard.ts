import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { SocketService } from '../../../../core/services/socket.service';
import { AdminApiService } from '../../services/admin-api.service';

type MonitorRow = {
  auctionId: string;
  status: string;
  currentPrice?: number;
  bidCount?: number;
  updatedAt: string;
};

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPage {
  private readonly _adminApi = inject(AdminApiService);
  private readonly _socket = inject(SocketService);

  readonly activeAuctions = signal(0);
  readonly bidsToday = signal(0);
  readonly revenue = signal(0);
  readonly newUsers = signal(0);

  readonly monitorRows = signal<MonitorRow[]>([]);
  readonly suspiciousAlerts = signal<Array<{ message: string; createdAt: string }>>([]);
  readonly loading = signal(true);

  readonly statsCards = computed(() => [
    { label: 'Active auctions', value: this.activeAuctions() },
    { label: 'Bids today', value: this.bidsToday() },
    { label: 'Revenue', value: this.revenue() },
    { label: 'New users', value: this.newUsers() },
  ]);

  readonly displayedColumns = ['auctionId', 'status', 'currentPrice', 'bidCount', 'updatedAt'];

  ngOnInit(): void {
    this._adminApi.getStats().subscribe({
      next: (stats) => {
        this.activeAuctions.set(stats.activeAuctions);
        this.newUsers.set(stats.totalUsers);
      },
      complete: () => this.loading.set(false),
    });

    this._adminApi.getRevenueReport().subscribe((report) => {
      this.revenue.set(report.revenue);
      this.bidsToday.set(report.transactionCount);
    });

    this._socket.connect('admin');
    this._socket.emit('joinAdminRoom');

    this._socket.on<Record<string, unknown>>('platformStats').subscribe((payload) => {
      this.activeAuctions.set(Number(payload['activeAuctions'] ?? this.activeAuctions()));
      this.bidsToday.set(Number(payload['bidsToday'] ?? this.bidsToday()));
      this.revenue.set(Number(payload['revenue'] ?? this.revenue()));
      this.newUsers.set(Number(payload['newUsers'] ?? this.newUsers()));
    });

    this._socket.on<Record<string, unknown>>('auctionMonitor').subscribe((payload) => {
      const row: MonitorRow = {
        auctionId: String(payload['auctionId'] ?? 'n/a'),
        status: String(payload['status'] ?? payload['type'] ?? 'UNKNOWN'),
        currentPrice: Number(payload['currentPrice'] ?? 0),
        bidCount: Number(payload['bidCount'] ?? 0),
        updatedAt: new Date().toISOString(),
      };
      this.monitorRows.update((rows) => [row, ...rows].slice(0, 100));
    });

    this._socket.on<Record<string, unknown>>('suspiciousBidAlert').subscribe((payload) => {
      this.suspiciousAlerts.update((alerts) => [
        {
          message: String(payload['message'] ?? 'Suspicious bid activity detected'),
          createdAt: new Date().toISOString(),
        },
        ...alerts,
      ]);
    });
  }
}
