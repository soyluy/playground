import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'auctions',
        loadComponent: () =>
          import('./pages/auction-management/auction-management').then(
            (m) => m.AuctionManagementPage,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/user-management/user-management').then(
            (m) => m.UserManagementPage,
          ),
      },
    ],
  },
];
