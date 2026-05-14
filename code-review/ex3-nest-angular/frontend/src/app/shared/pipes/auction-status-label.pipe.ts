import { Pipe, PipeTransform } from '@angular/core';

import { AuctionStatus } from '../../core/models/auction.model';
import { formatAuctionStatus } from '../../core/utils/format.utils';

@Pipe({
  name: 'auctionStatusLabel',
  standalone: true,
})
export class AuctionStatusLabelPipe implements PipeTransform {
  transform(value: AuctionStatus | string): string {
    return formatAuctionStatus(value as AuctionStatus);
  }
}
