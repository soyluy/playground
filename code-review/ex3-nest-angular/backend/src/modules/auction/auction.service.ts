import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AuctionItem } from '../../domain/entities/auction-item.entity';
import { Auction } from '../../domain/entities/auction.entity';
import { Bid } from '../../domain/entities/bid.entity';
import { User } from '../../domain/entities/user.entity';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { AuctionType } from '../../domain/enums/auction-type.enum';
import { ItemStatus } from '../../domain/enums/item-status.enum';
import { Watchlist } from '../../domain/entities/watchlist.entity';
import { AuctionRepository } from '../../infrastructure/repositories/auction.repository';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { WatchlistRepository } from '../../infrastructure/repositories/watchlist.repository';
import { PricingService } from '../pricing/pricing.service';

type PaginationInput = {
  page?: number;
  limit?: number;
};

type AuctionFilters = {
  status?: AuctionStatus;
  type?: AuctionType;
  sellerId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
};

@Injectable()
export class AuctionService {
  private readonly _itemRepository: Repository<AuctionItem>;
  private readonly _userRepository: Repository<User>;
  private readonly _watchlistEntityRepository: Repository<Watchlist>;

  constructor(
    private readonly _auctionRepository: AuctionRepository,
    private readonly _bidRepository: BidRepository,
    private readonly _watchlistRepository: WatchlistRepository,
    private readonly _pricingService: PricingService,
    private readonly _dataSource: DataSource,
  ) {
    this._itemRepository = _dataSource.getRepository(AuctionItem);
    this._userRepository = _dataSource.getRepository(User);
    this._watchlistEntityRepository = _dataSource.getRepository(Watchlist);
  }

  async createAuction(
    sellerId: string,
    payload: {
      itemId: string;
      type: AuctionType;
      startTime: Date;
      endTime: Date;
      startingPrice: number;
      reservePrice?: number | null;
      buyNowPrice?: number | null;
      bidIncrement?: number;
      extensionMinutes?: number;
      extensionThresholdSeconds?: number;
    },
  ): Promise<Auction> {
    const seller = await this._userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const item = await this._itemRepository.findOne({
      where: { id: payload.itemId },
      relations: { seller: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    if (item.seller.id !== sellerId) {
      throw new BadRequestException('Item does not belong to seller');
    }
    if (item.status !== ItemStatus.APPROVED) {
      throw new BadRequestException('Item is not approved');
    }
    if (payload.endTime <= payload.startTime) {
      throw new BadRequestException('Invalid auction timeline');
    }

    const auction = this._auctionRepository.create({
      seller,
      item,
      type: payload.type,
      status: AuctionStatus.DRAFT,
      startTime: payload.startTime,
      endTime: payload.endTime,
      startingPrice: payload.startingPrice,
      currentPrice: payload.startingPrice,
      reservePrice: payload.reservePrice ?? item.reservePrice ?? null,
      buyNowPrice: payload.buyNowPrice ?? item.buyNowPrice ?? null,
      bidIncrement: payload.bidIncrement ?? 1,
      extensionMinutes: payload.extensionMinutes ?? 2,
      extensionThresholdSeconds: payload.extensionThresholdSeconds ?? 60,
      winnerId: null,
      finalPrice: null,
      viewCount: 0,
      watcherCount: 0,
    });

    return this._auctionRepository.save(auction);
  }

  async updateAuction(
    auctionId: string,
    sellerId: string,
    patch: Partial<Auction>,
  ): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.seller.id !== sellerId) {
      throw new BadRequestException('Auction does not belong to seller');
    }
    if (![AuctionStatus.DRAFT, AuctionStatus.SCHEDULED].includes(auction.status)) {
      throw new BadRequestException('Auction cannot be updated now');
    }

    if (patch.startTime) {
      auction.startTime = patch.startTime;
    }
    if (patch.endTime) {
      auction.endTime = patch.endTime;
    }
    if (patch.buyNowPrice !== undefined) {
      auction.buyNowPrice = patch.buyNowPrice;
    }
    if (patch.reservePrice !== undefined) {
      auction.reservePrice = patch.reservePrice;
    }
    if (patch.bidIncrement !== undefined) {
      auction.bidIncrement = patch.bidIncrement;
    }
    if (patch.extensionMinutes !== undefined) {
      auction.extensionMinutes = patch.extensionMinutes;
    }
    if (patch.extensionThresholdSeconds !== undefined) {
      auction.extensionThresholdSeconds = patch.extensionThresholdSeconds;
    }

    return this._auctionRepository.save(auction);
  }

  async publishAuction(auctionId: string, sellerId: string): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.seller.id !== sellerId) {
      throw new BadRequestException('Auction does not belong to seller');
    }
    if (auction.status !== AuctionStatus.DRAFT) {
      throw new BadRequestException('Auction is not in draft status');
    }

    auction.status = AuctionStatus.SCHEDULED;
    return this._auctionRepository.save(auction);
  }

  async cancelAuction(auctionId: string, sellerId: string): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.seller.id !== sellerId) {
      throw new BadRequestException('Auction does not belong to seller');
    }
    if (auction.status === AuctionStatus.ENDED) {
      throw new BadRequestException('Ended auction cannot be cancelled');
    }

    auction.status = AuctionStatus.CANCELLED;
    return this._auctionRepository.save(auction);
  }

  async getAuction(auctionId: string): Promise<Auction> {
    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  async listAuctions(
    pagination: PaginationInput = {},
  ): Promise<{ data: Auction[]; total: number }> {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    return this._auctionRepository.searchAuctions({}, { page, limit });
  }

  async searchAuctions(
    filters: AuctionFilters,
    pagination: PaginationInput = {},
  ): Promise<{ data: Auction[]; total: number }> {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    return this._auctionRepository.searchAuctions(filters, { page, limit });
  }

  async startAuction(auctionId: string, now: Date = new Date()): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.status !== AuctionStatus.SCHEDULED) {
      throw new BadRequestException('Auction is not scheduled');
    }
    if (auction.startTime > now) {
      throw new BadRequestException('Auction start time is in the future');
    }

    auction.status = AuctionStatus.ACTIVE;
    if (auction.type === AuctionType.DUTCH) {
      auction.currentPrice = this._pricingService.calculateDutchCurrentPrice(auction, now);
    }
    return this._auctionRepository.save(auction);
  }

  async endAuction(auctionId: string, now: Date = new Date()): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (
      auction.status !== AuctionStatus.ACTIVE &&
      auction.status !== AuctionStatus.ENDING_SOON
    ) {
      throw new BadRequestException('Auction is not active');
    }
    if (auction.endTime > now) {
      throw new BadRequestException('Auction has not ended yet');
    }

    return this.processAuctionEnd(auctionId, now);
  }

  async processAuctionEnd(auctionId: string, now: Date = new Date()): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    const bids = await this._bidRepository.findByAuction(auction.id);

    const validBids = bids
      .filter((bid) => !bid.isRetracted)
      .filter((bid) => bid.createdAt < auction.endTime);

    const highestBid = validBids.length ? validBids[0] : null;
    if (!highestBid) {
      auction.status = AuctionStatus.FAILED;
      auction.finalPrice = null;
      auction.winnerId = null;
      return this._auctionRepository.save(auction);
    }

    const reserveMet =
      auction.reservePrice === null || highestBid.amount >= auction.reservePrice;

    if (!reserveMet) {
      auction.status = AuctionStatus.FAILED;
      auction.finalPrice = highestBid.amount;
      auction.winnerId = null;
      return this._auctionRepository.save(auction);
    }

    auction.status = AuctionStatus.ENDED;
    auction.finalPrice = highestBid.amount;
    auction.winnerId = highestBid.bidder.id;

    await this._bidRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: false })
      .where('auction_id = :auctionId', { auctionId: auction.id })
      .execute();

    await this._bidRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: true })
      .where('id = :bidId', { bidId: highestBid.id })
      .execute();

    return this._auctionRepository.save(auction);
  }

  async incrementViewCount(auctionId: string): Promise<void> {
    await this._auctionRepository.incrementViewCount(auctionId);
  }

  async addWatcher(auctionId: string, userId: string): Promise<void> {
    const auction = await this.getAuction(auctionId);
    const user = await this._userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isWatching = await this._watchlistRepository.isWatching(userId, auctionId);
    if (isWatching) {
      return;
    }

    const watch = this._watchlistEntityRepository.create({
      auction,
      user,
      notifyOnBid: true,
      notifyOnEndingSoon: true,
    });
    await this._watchlistEntityRepository.save(watch);

    auction.watcherCount += 1;
    await this._auctionRepository.save(auction);
  }

  async removeWatcher(auctionId: string, userId: string): Promise<void> {
    const auction = await this.getAuction(auctionId);
    await this._watchlistEntityRepository.delete({
      auction: { id: auctionId },
      user: { id: userId },
    });

    const watcherCount = await this._watchlistRepository.countWatchers(auctionId);
    auction.watcherCount = watcherCount;
    await this._auctionRepository.save(auction);
  }

  async refreshDutchPrice(auctionId: string, now: Date = new Date()): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.type !== AuctionType.DUTCH) {
      return auction;
    }
    if (!auction.isActive(now)) {
      return auction;
    }

    auction.currentPrice = this._pricingService.calculateDutchCurrentPrice(auction, now);
    return this._auctionRepository.save(auction);
  }

  async handleLastMinuteBid(auctionId: string, bidPlacedAt: Date): Promise<Auction> {
    const auction = await this.getAuction(auctionId);
    if (auction.shouldExtend(bidPlacedAt)) {
      auction.extendAuction(bidPlacedAt);
      return this._auctionRepository.save(auction);
    }

    return auction;
  }
}
