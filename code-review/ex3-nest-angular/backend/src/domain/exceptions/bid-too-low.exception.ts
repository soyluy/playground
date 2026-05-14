import { DomainException } from './domain.exception';

export class BidTooLowException extends DomainException {
  constructor(minimumAllowed: number, attemptedAmount: number) {
    super('Bid amount is too low', 'BID_TOO_LOW', {
      minimumAllowed,
      attemptedAmount,
    });
  }
}
