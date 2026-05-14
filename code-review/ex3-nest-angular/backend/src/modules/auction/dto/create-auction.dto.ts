import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

import { AuctionType } from '../../../domain/enums/auction-type.enum';

export class CreateAuctionDto {
  @IsUUID()
  itemId!: string;

  @IsEnum(AuctionType)
  type!: AuctionType;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  startingPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reservePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  buyNowPrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  bidIncrement?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  extensionMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  extensionThresholdSeconds?: number;
}
