import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AutoBid } from '../../domain/entities/auto-bid.entity';

@Injectable()
export class AutoBidRepository extends Repository<AutoBid> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(AutoBid, _dataSource.createEntityManager());
  }

  async findByAuctionAndBidder(
    auctionId: string,
    bidderId: string,
  ): Promise<AutoBid | null> {
    return this.findOne({
      where: {
        auction: { id: auctionId },
        bidder: { id: bidderId },
      },
      relations: {
        auction: true,
        bidder: true,
      },
    });
  }

  async findActiveByAuction(auctionId: string, bidderId: string): Promise<AutoBid | null> {
    return this.findOne({
      where: {
        auction: { id: auctionId },
        bidder: { id: bidderId },
        isActive: true,
      },
    });
  }

  async findAllActiveForAuction(auctionId: string): Promise<AutoBid[]> {
    return this.find({
      where: {
        auction: { id: auctionId },
        isActive: true,
      },
      relations: {
        bidder: true,
      },
      order: { maxAmount: 'DESC', createdAt: 'ASC' },
    });
  }

  async deactivateForAuction(auctionId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(AutoBid)
      .set({ isActive: false })
      .where('auction_id = :auctionId', { auctionId })
      .execute();
  }

  async findConflicting(
    auctionId: string,
    bidderId: string,
    maxAmount: number,
  ): Promise<AutoBid[]> {
    return this.createQueryBuilder('autoBid')
      .leftJoinAndSelect('autoBid.bidder', 'bidder')
      .where('autoBid.auction_id = :auctionId', { auctionId })
      .andWhere('autoBid.is_active = true')
      .andWhere('autoBid.bidder_id != :bidderId', { bidderId })
      .andWhere('autoBid.max_amount >= :maxAmount', { maxAmount })
      .orderBy('autoBid.max_amount', 'DESC')
      .getMany();
  }
}
