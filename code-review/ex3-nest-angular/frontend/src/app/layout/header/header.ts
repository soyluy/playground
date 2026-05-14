import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../core/services/auth.service';
import { NotificationBellComponent } from '../../features/notification/components/notification-bell/notification-bell';
import { NotificationPanelComponent } from '../../features/notification/components/notification-panel/notification-panel';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    NotificationBellComponent,
    NotificationPanelComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);

  readonly currentUser = this._auth.currentUser;
  readonly isAuthenticated = this._auth.isAuthenticated;
  readonly userName = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 'Guest';
    }
    return `${user.firstName} ${user.lastName}`;
  });

  logout(): void {
    this._auth.logout().subscribe();
  }

  goToProfile(): void {
    this._router.navigate(['/profile']);
  }
}
