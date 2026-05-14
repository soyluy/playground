import { DomainException } from './domain.exception';

export class AutoBidConflictException extends DomainException {
  constructor(auctionId: string, bidderId: string) {
    super('Auto bid configuration conflict', 'AUTO_BID_CONFLICT', {
      auctionId,
      bidderId,
    });
  }
}
