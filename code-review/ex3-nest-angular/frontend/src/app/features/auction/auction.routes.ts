import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { auctionResolver } from '../../core/resolvers/auction.resolver';

export const AUCTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/auction-list/auction-list').then((m) => m.AuctionListComponent),
  },
  {
    path: 'create',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER'] },
    loadComponent: () =>
      import('./pages/create-auction/create-auction').then((m) => m.CreateAuctionPage),
  },
  {
    path: ':id',
    resolve: { auction: auctionResolver },
    loadComponent: () =>
      import('./pages/auction-detail/auction-detail').then((m) => m.AuctionDetailPage),
  },
  {
    path: 'items/create',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER'] },
    loadComponent: () =>
      import('../auction-item/pages/create-item/create-item').then((m) => m.CreateItemPage),
  },
];
