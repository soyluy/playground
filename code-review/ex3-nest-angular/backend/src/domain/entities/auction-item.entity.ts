import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Auction } from './auction.entity';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
import { ItemCondition } from '../enums/item-condition.enum';
import { ItemStatus } from '../enums/item-status.enum';

@Entity({ name: 'auction_items' })
export class AuctionItem extends BaseEntity {
  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: ItemCondition })
  condition!: ItemCondition;

  @Column({ type: 'text', array: true, default: '{}' })
  images!: string[];

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  startingPrice!: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string) => Number(value),
    },
  })
  reservePrice!: number | null;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  buyNowPrice!: number | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @ManyToOne(() => Category, (category) => category.items, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.DRAFT })
  status!: ItemStatus;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  weight!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  dimensions!: { width: number; height: number; depth: number } | null;

  @OneToMany(() => Auction, (auction) => auction.item)
  auctions!: Auction[];
}
