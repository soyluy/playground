export class AuctionExtendedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly previousEndTime: Date,
    public readonly newEndTime: Date,
    public readonly triggeredByBidId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
