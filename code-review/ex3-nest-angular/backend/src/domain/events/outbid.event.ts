export class OutbidEvent {
  constructor(
    public readonly auctionId: string,
    public readonly previousBidderId: string,
    public readonly newBidderId: string,
    public readonly previousAmount: number,
    public readonly newAmount: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
