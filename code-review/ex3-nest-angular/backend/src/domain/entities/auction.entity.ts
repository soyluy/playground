import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AuctionItem } from './auction-item.entity';
import { BaseEntity } from './base.entity';
import { Bid } from './bid.entity';
import { User } from './user.entity';
import { AuctionStatus, isTransitionAllowed } from '../enums/auction-status.enum';
import { AuctionType } from '../enums/auction-type.enum';

@Entity({ name: 'auctions' })
export class Auction extends BaseEntity {
  @OneToOne(() => AuctionItem, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item!: AuctionItem;

  @Column({ type: 'enum', enum: AuctionType })
  type!: AuctionType;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.DRAFT,
  })
  status!: AuctionStatus;

  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @Column({ type: 'timestamptz' })
  endTime!: Date;

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
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  currentPrice!: number;

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

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  bidIncrement!: number;

  @Column({ type: 'int', default: 2 })
  extensionMinutes!: number;

  @Column({ type: 'int', default: 60 })
  extensionThresholdSeconds!: number;

  @Column({ type: 'uuid', nullable: true })
  winnerId!: string | null;

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
  finalPrice!: number | null;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  watcherCount!: number;

  @ManyToOne(() => User, (user) => user.auctions, { nullable: false })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids!: Bid[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'auction_watchers',
    joinColumn: { name: 'auction_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  watchers!: User[];

  isActive(now: Date = new Date()): boolean {
    return (
      this.status === AuctionStatus.ACTIVE &&
      this.startTime <= now &&
      this.endTime > now
    );
  }

  isEnded(now: Date = new Date()): boolean {
    return this.status === AuctionStatus.ENDED || this.endTime <= now;
  }

  canPlaceBid(amount: number, now: Date = new Date()): boolean {
    if (!this.isActive(now) || this.status === AuctionStatus.ENDING_SOON) {
      return false;
    }

    if (
      this.type === AuctionType.ENGLISH ||
      this.type === AuctionType.RESERVE ||
      this.type === AuctionType.BUY_NOW
    ) {
      const minimumNextBid = this.currentPrice + this.bidIncrement;
      return amount >= minimumNextBid;
    }

    if (this.type === AuctionType.DUTCH) {
      return amount > this.currentPrice;
    }

    return false;
  }

  canBuyNow(now: Date = new Date()): boolean {
    if (!this.isActive(now)) {
      return false;
    }

    if (this.buyNowPrice === null) {
      return false;
    }

    return this.type !== AuctionType.DUTCH;
  }

  getTimeRemaining(now: Date = new Date()): number {
    const remainingMs = this.endTime.getTime() - now.getTime();
    return remainingMs > 0 ? remainingMs : 0;
  }

  shouldExtend(now: Date = new Date()): boolean {
    if (!this.isActive(now) || this.extensionMinutes <= 0) {
      return false;
    }

    const remainingSeconds = Math.floor(this.getTimeRemaining(now) / 1000);
    return remainingSeconds < this.extensionThresholdSeconds;
  }

  extendAuction(now: Date = new Date()): void {
    if (!this.shouldExtend(now)) {
      return;
    }

    this.endTime = new Date(
      this.endTime.getTime() + this.extensionMinutes * 60 * 1000,
    );
  }

  transitionTo(nextStatus: AuctionStatus): boolean {
    if (!isTransitionAllowed(this.status, nextStatus)) {
      return false;
    }

    this.status = nextStatus;
    return true;
  }
}
