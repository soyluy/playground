import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Auction } from './auction.entity';
import { User } from './user.entity';

@Entity({ name: 'bids' })
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Auction, (auction) => auction.bids, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @ManyToOne(() => User, (user) => user.bids, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bidder_id' })
  bidder!: User;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amount!: number;

  @Column({ type: 'boolean', default: false })
  isAutoBid!: boolean;

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
  maxAutoBidAmount!: number | null;

  @Column({ type: 'boolean', default: false })
  isWinning!: boolean;

  @Column({ type: 'boolean', default: false })
  isRetracted!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  retractedAt!: Date | null;

  @Column({ type: 'varchar', length: 64 })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date();
  }
}
