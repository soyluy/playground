export class BuyNowPurchasedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly buyNowPrice: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
