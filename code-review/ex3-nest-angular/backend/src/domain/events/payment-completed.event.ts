export class PaymentCompletedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly amount: number,
    public readonly paymentIntentId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
