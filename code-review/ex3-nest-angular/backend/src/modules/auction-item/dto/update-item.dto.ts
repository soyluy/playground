import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { ItemCondition } from '../../../domain/enums/item-condition.enum';
import { ItemStatus } from '../../../domain/enums/item-status.enum';

class ItemDimensionsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  width!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depth!: number;
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  startingPrice?: number;

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
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemDimensionsDto)
  dimensions?: ItemDimensionsDto | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appendImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeImages?: string[];

  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}
