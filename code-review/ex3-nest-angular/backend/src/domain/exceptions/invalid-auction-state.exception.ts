import { AuctionStatus } from '../enums/auction-status.enum';
import { DomainException } from './domain.exception';

export class InvalidAuctionStateException extends DomainException {
  constructor(currentStatus: AuctionStatus, targetStatus?: AuctionStatus) {
    super('Invalid auction state transition', 'INVALID_AUCTION_STATE', {
      currentStatus,
      targetStatus,
    });
  }
}
