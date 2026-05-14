import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.ProfilePage),
    children: [
      {
        path: 'wallet',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/wallet/wallet').then((m) => m.WalletComponent),
      },
      {
        path: 'watchlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/watchlist/watchlist').then((m) => m.WatchlistComponent),
      },
    ],
  },
];
