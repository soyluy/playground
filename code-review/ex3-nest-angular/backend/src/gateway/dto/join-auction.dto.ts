import { IsUUID } from 'class-validator';

export class JoinAuctionDto {
  @IsUUID()
  auctionId!: string;
}
