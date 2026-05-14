import { DomainException } from './domain.exception';

export class AuctionNotFoundException extends DomainException {
  constructor(auctionId: string) {
    super(`Auction ${auctionId} not found`, 'AUCTION_NOT_FOUND', { auctionId });
  }
}
