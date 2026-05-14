import { Auction } from '../entities/auction.entity';

export class AuctionEndedEvent {
  constructor(
    public auction: Auction,
    public winnerId: string | null,
    public finalPrice: number | null,
    public endedAt: Date = new Date(),
  ) {}
}
