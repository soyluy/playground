import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { ItemCondition } from '../../../domain/enums/item-condition.enum';

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

export class CreateItemDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(ItemCondition)
  condition!: ItemCondition;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

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

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemDimensionsDto)
  dimensions?: ItemDimensionsDto | null;
}
