import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Watchlist } from '../../domain/entities/watchlist.entity';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';

@Injectable()
export class WatchlistRepository extends Repository<Watchlist> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(Watchlist, _dataSource.createEntityManager());
  }

  async findByUser(userId: string): Promise<Watchlist[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: {
        auction: { item: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAuction(auctionId: string): Promise<Watchlist[]> {
    return this.find({
      where: { auction: { id: auctionId } },
      relations: {
        user: true,
      },
    });
  }

  async isWatching(userId: string, auctionId: string): Promise<boolean> {
    const count = await this.count({
      where: {
        user: { id: userId },
        auction: { id: auctionId },
      },
    });

    return count > 0;
  }

  async findAuctionsEndingSoonForUser(
    userId: string,
    minutes: number,
  ): Promise<Watchlist[]> {
    return this.createQueryBuilder('watchlist')
      .innerJoinAndSelect('watchlist.auction', 'auction')
      .innerJoinAndSelect('auction.item', 'item')
      .where('watchlist.user_id = :userId', { userId })
      .andWhere('watchlist.notify_on_ending_soon = true')
      .andWhere('auction.status IN (:...statuses)', {
        statuses: [AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON],
      })
      .andWhere(`auction.end_time <= NOW() + INTERVAL '${minutes} minutes'`)
      .andWhere('auction.end_time > NOW()')
      .orderBy('auction.end_time', 'ASC')
      .getMany();
  }

  async countWatchers(auctionId: string): Promise<number> {
    return this.count({
      where: { auction: { id: auctionId } },
    });
  }
}
