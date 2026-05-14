import { AuctionStatus } from '../../../domain/enums/auction-status.enum';
import { AuctionType } from '../../../domain/enums/auction-type.enum';

export class AuctionResponseDto {
  id!: string;
  itemId!: string;
  sellerId!: string;
  type!: AuctionType;
  status!: AuctionStatus;
  startTime!: Date;
  endTime!: Date;
  startingPrice!: number;
  currentPrice!: number;
  reservePrice!: number | null;
  buyNowPrice!: number | null;
  bidIncrement!: number;
  winnerId!: string | null;
  finalPrice!: number | null;
  viewCount!: number;
  watcherCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
