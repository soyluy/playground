import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class SetAutoBidDto {
  @IsUUID()
  auctionId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  maxAmount!: number;
}
