import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Auction } from './auction.entity';
import { User } from './user.entity';

@Entity({ name: 'watchlists' })
@Unique(['user', 'auction'])
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Auction, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @Column({ type: 'boolean', default: true })
  notifyOnBid!: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnEndingSoon!: boolean;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date();
  }
}
