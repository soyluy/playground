export class BidResponseDto {
  id!: string;
  auctionId!: string;
  bidderId!: string;
  amount!: number;
  isAutoBid!: boolean;
  isWinning!: boolean;
  isRetracted!: boolean;
  createdAt!: Date;
}
