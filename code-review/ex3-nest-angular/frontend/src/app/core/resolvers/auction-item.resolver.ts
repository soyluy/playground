import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AuctionItem } from '../models/auction-item.model';
import { AuctionItemApiService } from '../../features/auction-item/services/auction-item-api.service';

export const auctionItemResolver: ResolveFn<AuctionItem | null> = (route) => {
  const itemApi = inject(AuctionItemApiService);
  const router = inject(Router);

  const itemId = route.paramMap.get('id');
  if (!itemId) {
    router.navigate(['/items']);
    return of(null);
  }

  return itemApi.getItem(itemId).pipe(
    catchError(() => {
      router.navigate(['/items']);
      return of(null);
    }),
  );
};
