import { AuctionType } from '../enums/auction-type.enum';

export class AuctionStartedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly type: AuctionType,
    public readonly startedAt: Date = new Date(),
  ) {}
}
