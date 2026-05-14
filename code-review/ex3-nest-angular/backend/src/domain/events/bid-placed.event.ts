export class BidPlacedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly bidId: string,
    public readonly bidderId: string,
    public readonly amount: number,
    public readonly previousWinningBidderId: string | null,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
