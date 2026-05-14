import { Column, Entity, OneToMany } from 'typeorm';

import { Auction } from './auction.entity';
import { BaseEntity } from './base.entity';
import { Bid } from './bid.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'boolean', default: false })
  isBanned!: boolean;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  balance!: number;

  @OneToMany(() => Auction, (auction) => auction.seller)
  auctions!: Auction[];

  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids!: Bid[];
}
