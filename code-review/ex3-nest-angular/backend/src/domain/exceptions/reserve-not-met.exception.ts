import { DomainException } from './domain.exception';

export class ReserveNotMetException extends DomainException {
  constructor(reservePrice: number, finalBid: number) {
    super('Reserve price was not met', 'RESERVE_NOT_MET', {
      reservePrice,
      finalBid,
    });
  }
}
