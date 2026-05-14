import { AuctionStatus } from '../../../domain/enums/auction-status.enum';
import { AuctionType } from '../../../domain/enums/auction-type.enum';

export class AuctionSummaryDto {
  id!: string;
  title!: string;
  type!: AuctionType;
  status!: AuctionStatus;
  currentPrice!: number;
  endTime!: Date;
  watcherCount!: number;
}
