import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Auction } from './auction.entity';
import { User } from './user.entity';

@Entity({ name: 'auto_bids' })
export class AutoBid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Auction, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
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
  maxAmount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastTriggeredAt!: Date | null;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  updatedAt!: Date;

  @BeforeInsert()
  setTimestamps(): void {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
