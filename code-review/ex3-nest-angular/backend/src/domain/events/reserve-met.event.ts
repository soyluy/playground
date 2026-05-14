import { AuctionType } from '../enums/auction-type.enum';

export class ReserveMetEvent {
  constructor(
    public readonly auctionId: string,
    public readonly bidId: string,
    public readonly reservePrice: number,
    public readonly amount: number,
    public readonly type: AuctionType,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
