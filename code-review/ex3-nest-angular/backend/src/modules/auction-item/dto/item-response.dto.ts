import { ItemCondition } from '../../../domain/enums/item-condition.enum';
import { ItemStatus } from '../../../domain/enums/item-status.enum';

export class ItemResponseDto {
  id!: string;
  title!: string;
  description!: string;
  condition!: ItemCondition;
  images!: string[];
  startingPrice!: number;
  reservePrice!: number | null;
  buyNowPrice!: number | null;
  status!: ItemStatus;
  sellerId!: string;
  categoryId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
