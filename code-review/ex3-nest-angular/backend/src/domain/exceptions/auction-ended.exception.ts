import { DomainException } from './domain.exception';

export class AuctionEndedException extends DomainException {
  constructor(auctionId: string) {
    super(`Auction ${auctionId} has ended`, 'AUCTION_ENDED', { auctionId });
  }
}
