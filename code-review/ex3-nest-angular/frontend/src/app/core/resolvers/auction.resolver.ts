import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { Auction } from '../models/auction.model';
import { AuctionApiService } from '../../features/auction/services/auction-api.service';

export const auctionResolver: ResolveFn<Auction | null> = (route) => {
  const auctionApi = inject(AuctionApiService);
  const router = inject(Router);

  const auctionId = route.paramMap.get('id');
  if (!auctionId) {
    router.navigate(['/auctions']);
    return of(null);
  }

  return auctionApi.getAuction(auctionId).pipe(
    tap((auction) => {
      if (!auction) {
        router.navigate(['/auctions']);
      }
    }),
    catchError(() => {
      router.navigate(['/auctions']);
      return of(null);
    }),
  );
};
