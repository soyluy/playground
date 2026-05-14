import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import { Auction } from '../../domain/entities/auction.entity';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { AuctionType } from '../../domain/enums/auction-type.enum';

type AuctionSearchFilters = {
  status?: AuctionStatus;
  type?: AuctionType;
  sellerId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
};

type PaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class AuctionRepository extends Repository<Auction> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(Auction, _dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Auction | null> {
    return this.findOne({
      where: { id },
      relations: {
        item: true,
        seller: true,
      },
    });
  }

  async findActive(limit: number = 50): Promise<Auction[]> {
    return this.find({
      where: { status: AuctionStatus.ACTIVE },
      relations: {
        item: true,
      },
      order: { endTime: 'ASC' },
      take: limit,
    });
  }

  async findByStatus(status: AuctionStatus): Promise<Auction[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySeller(sellerId: string): Promise<Auction[]> {
    return this.createQueryBuilder('auction')
      .leftJoinAndSelect('auction.item', 'item')
      .where('auction.seller_id = :sellerId', { sellerId })
      .orderBy('auction.createdAt', 'DESC')
      .getMany();
  }

  async findEndingSoon(minutes: number): Promise<Auction[]> {
    return this.createQueryBuilder('auction')
      .leftJoinAndSelect('auction.item', 'item')
      .where('auction.status IN (:...statuses)', {
        statuses: [AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON],
      })
      .andWhere(`auction.endTime <= NOW() + INTERVAL '${minutes} minutes'`)
      .andWhere('auction.endTime > NOW()')
      .orderBy('auction.endTime', 'ASC')
      .getMany();
  }

  async findByCategory(categoryId: string): Promise<Auction[]> {
    return this.createQueryBuilder('auction')
      .innerJoinAndSelect('auction.item', 'item')
      .where('item.category_id = :categoryId', { categoryId })
      .andWhere('auction.status <> :draft', { draft: AuctionStatus.DRAFT })
      .orderBy('auction.createdAt', 'DESC')
      .getMany();
  }

  async searchAuctions(
    filters: AuctionSearchFilters,
    pagination: PaginationInput,
  ): Promise<{ data: Auction[]; total: number }> {
    const qb = this.createQueryBuilder('auction')
      .leftJoinAndSelect('auction.item', 'item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('auction.seller', 'seller');

    this.applySearchFilters(qb, filters);

    const page = pagination.page < 1 ? 1 : pagination.page;
    const limit = pagination.limit > 100 ? 100 : pagination.limit;
    qb.orderBy('auction.end_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findExpiredActive(referenceTime: Date = new Date()): Promise<Auction[]> {
    return this.createQueryBuilder('auction')
      .where('auction.status IN (:...statuses)', {
        statuses: [AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON],
      })
      .andWhere('auction.end_time <= :referenceTime', { referenceTime })
      .getMany();
  }

  async incrementViewCount(auctionId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Auction)
      .set({
        viewCount: () => '"viewCount" + 1',
      })
      .where('id = :auctionId', { auctionId })
      .execute();
  }

  async updateCurrentPrice(
    auctionId: string,
    currentPrice: number,
    winnerId?: string | null,
  ): Promise<void> {
    await this.createQueryBuilder()
      .update(Auction)
      .set({
        currentPrice,
        winnerId: winnerId ?? null,
      })
      .where('id = :auctionId', { auctionId })
      .execute();
  }

  async findAuctionsWithAutoBids(limit: number = 100): Promise<Auction[]> {
    return this.createQueryBuilder('auction')
      .innerJoin('auto_bids', 'autoBid', 'autoBid.auction_id = auction.id')
      .andWhere('autoBid.is_active = true')
      .andWhere('auction.status IN (:...statuses)', {
        statuses: [AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON],
      })
      .leftJoinAndSelect('auction.item', 'item')
      .orderBy('auction.endTime', 'ASC')
      .limit(limit)
      .getMany();
  }

  async getAuctionStats(sellerId?: string): Promise<{
    total: number;
    active: number;
    ended: number;
    avgFinalPrice: number;
  }> {
    const qb = this.createQueryBuilder('auction').select('COUNT(*)', 'total');

    if (sellerId) {
      qb.where('auction.seller_id = :sellerId', { sellerId });
    }

    const baseWhere = sellerId ? 'auction.seller_id = :sellerId AND ' : '';
    qb.addSelect(
      `SUM(CASE WHEN ${baseWhere}auction.status = '${AuctionStatus.ACTIVE}' THEN 1 ELSE 0 END)`,
      'active',
    );
    qb.addSelect(
      `SUM(CASE WHEN ${baseWhere}auction.status = '${AuctionStatus.ENDED}' THEN 1 ELSE 0 END)`,
      'ended',
    );
    qb.addSelect('COALESCE(AVG(auction.finalPrice), 0)', 'avgFinalPrice');

    const result = await qb.setParameters(sellerId ? { sellerId } : {}).getRawOne<{
      total: string;
      active: string;
      ended: string;
      avgFinalPrice: string;
    }>();

    return {
      total: Number(result.total ?? 0),
      active: Number(result.active ?? 0),
      ended: Number(result.ended ?? 0),
      avgFinalPrice: Number(result.avgFinalPrice ?? 0),
    };
  }

  private applySearchFilters(
    qb: SelectQueryBuilder<Auction>,
    filters: AuctionSearchFilters,
  ): void {
    if (filters.status) {
      qb.andWhere('auction.status = :status', { status: filters.status });
    }

    if (filters.type) {
      qb.andWhere('auction.type = :type', { type: filters.type });
    }

    if (filters.sellerId) {
      qb.andWhere('auction.seller_id = :sellerId', { sellerId: filters.sellerId });
    }

    if (filters.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: filters.categorySlug,
      });
    }

    if (typeof filters.minPrice === 'number') {
      qb.andWhere('auction.currentPrice >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (typeof filters.maxPrice === 'number') {
      qb.andWhere('auction.currentPrice <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.q) {
      qb.andWhere('(item.title ILIKE :q OR item.description ILIKE :q)', {
        q: `%${filters.q}%`,
      });
    }
  }
}
