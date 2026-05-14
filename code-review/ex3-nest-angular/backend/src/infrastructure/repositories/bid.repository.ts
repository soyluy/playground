import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Bid } from '../../domain/entities/bid.entity';

type PaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class BidRepository extends Repository<Bid> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(Bid, _dataSource.createEntityManager());
  }

  async findByAuction(auctionId: string): Promise<Bid[]> {
    return this.find({
      where: { auction: { id: auctionId } },
      relations: { bidder: true },
      order: { amount: 'DESC', createdAt: 'ASC' },
    });
  }

  async findByBidder(bidderId: string, limit: number = 100): Promise<Bid[]> {
    return this.find({
      where: { bidder: { id: bidderId } },
      relations: { auction: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findHighestBid(auctionId: string): Promise<Bid | null> {
    return this.createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .where('bid.auction_id = :auctionId', { auctionId })
      .andWhere('bid.is_retracted = false')
      .orderBy('bid.amount', 'DESC')
      .addOrderBy('bid.createdAt', 'ASC')
      .getOne();
  }

  async findWinningBid(auctionId: string): Promise<Bid | null> {
    return this.findOne({
      where: {
        auction: { id: auctionId },
        isWinning: true,
      },
      relations: {
        bidder: true,
      },
    });
  }

  async findBidHistory(
    auctionId: string,
    pagination: PaginationInput,
  ): Promise<{ data: Bid[]; total: number }> {
    const page = pagination.page < 1 ? 1 : pagination.page;
    const limit = pagination.limit > 200 ? 200 : pagination.limit;

    const [data, total] = await this.findAndCount({
      where: {
        auction: { id: auctionId },
      },
      relations: {
        bidder: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async countBidsByAuction(auctionId: string): Promise<number> {
    return this.count({
      where: {
        auction: { id: auctionId },
      },
    });
  }

  async findAutoBidCandidates(auctionId: string, currentPrice: number): Promise<Bid[]> {
    return this.createQueryBuilder('bid')
      .where('bid.auction_id = :auctionId', { auctionId })
      .andWhere('bid.is_auto_bid = true')
      .andWhere('bid.max_auto_bid_amount IS NOT NULL')
      .andWhere('bid.max_auto_bid_amount >= :currentPrice', { currentPrice })
      .andWhere('bid.is_retracted = false')
      .orderBy('bid.max_auto_bid_amount', 'DESC')
      .addOrderBy('bid.created_at', 'ASC')
      .getMany();
  }

  async getTopBidders(limit: number = 20): Promise<
    Array<{
      bidderId: string;
      bidCount: number;
      totalAmount: number;
    }>
  > {
    const rows = await this.createQueryBuilder('bid')
      .select('bid.bidder_id', 'bidderId')
      .addSelect('COUNT(*)', 'bidCount')
      .addSelect('COALESCE(SUM(bid.amount), 0)', 'totalAmount')
      .where('bid.is_retracted = false')
      .groupBy('bid.bidder_id')
      .orderBy('bidCount', 'DESC')
      .addOrderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany<{ bidderId: string; bidCount: string; totalAmount: string }>();

    return rows.map((row) => ({
      bidderId: row.bidderId,
      bidCount: Number(row.bidCount),
      totalAmount: Number(row.totalAmount),
    }));
  }
}
