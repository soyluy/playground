import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AutoBid } from '../../domain/entities/auto-bid.entity';
import { Bid } from '../../domain/entities/bid.entity';
import { AuctionRepository } from '../../infrastructure/repositories/auction.repository';
import { AutoBidRepository } from '../../infrastructure/repositories/auto-bid.repository';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class AutoBidService {
  private readonly _bidEntityRepository: Repository<Bid>;

  constructor(
    private readonly _autoBidRepository: AutoBidRepository,
    private readonly _auctionRepository: AuctionRepository,
    private readonly _bidRepository: BidRepository,
    private readonly _userRepository: UserRepository,
    private readonly _dataSource: DataSource,
  ) {
    this._bidEntityRepository = _dataSource.getRepository(Bid);
  }

  async setAutoBid(
    auctionId: string,
    userId: string,
    maxAmount: number,
  ): Promise<AutoBid> {
    if (maxAmount <= 0) {
      throw new BadRequestException('Max amount must be positive');
    }

    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this._autoBidRepository.findByAuctionAndBidder(auctionId, userId);
    if (existing?.isActive) {
      throw new BadRequestException('Auto bid already configured');
    }

    const autoBid = this._autoBidRepository.create({
      auction,
      bidder: user,
      maxAmount,
      isActive: true,
      lastTriggeredAt: null,
    });

    return this._autoBidRepository.save(autoBid);
  }

  async updateAutoBid(
    auctionId: string,
    userId: string,
    maxAmount: number,
  ): Promise<AutoBid> {
    const autoBid = await this.getAutoBid(auctionId, userId);
    if (!autoBid.isActive) {
      throw new BadRequestException('Auto bid is not active');
    }
    if (maxAmount <= 0) {
      throw new BadRequestException('Max amount must be positive');
    }

    autoBid.maxAmount = maxAmount;
    return this._autoBidRepository.save(autoBid);
  }

  async cancelAutoBid(auctionId: string, userId: string): Promise<void> {
    const autoBid = await this.getAutoBid(auctionId, userId);
    autoBid.isActive = false;
    await this._autoBidRepository.save(autoBid);
  }

  async getAutoBid(auctionId: string, userId: string): Promise<AutoBid> {
    const autoBid = await this._autoBidRepository.findByAuctionAndBidder(auctionId, userId);
    if (!autoBid) {
      throw new NotFoundException('Auto bid not found');
    }
    return autoBid;
  }

  async getUserAutoBids(userId: string): Promise<AutoBid[]> {
    return this._autoBidRepository
      .createQueryBuilder('autoBid')
      .leftJoinAndSelect('autoBid.auction', 'auction')
      .where('autoBid.bidder_id = :userId', { userId })
      .orderBy('autoBid.created_at', 'DESC')
      .getMany();
  }

  async triggerAutoBid(auctionId: string, triggerBidId: string): Promise<Bid | null> {
    const triggerBid = await this._bidEntityRepository.findOne({
      where: { id: triggerBidId },
      relations: { auction: true, bidder: true },
    });
    if (!triggerBid) {
      throw new NotFoundException('Trigger bid not found');
    }

    const autoBids = await this._autoBidRepository.findAllActiveForAuction(auctionId);
    const eligible = autoBids
      .filter((candidate) => candidate.bidder.id !== triggerBid.bidder.id)
      .filter((candidate) => candidate.maxAmount >= triggerBid.amount + triggerBid.auction.bidIncrement)
      .sort((a, b) => a.maxAmount - b.maxAmount);

    if (!eligible.length) {
      return null;
    }

    const challenger = eligible[0];
    const resolvedAmount = this.resolveAutoBidConflict(
      triggerBid.amount,
      challenger.maxAmount,
      triggerBid.auction.bidIncrement,
    );

    if (resolvedAmount <= triggerBid.amount) {
      return null;
    }

    const autoBid = this._bidEntityRepository.create({
      auction: triggerBid.auction,
      bidder: challenger.bidder,
      amount: resolvedAmount,
      isAutoBid: true,
      maxAutoBidAmount: challenger.maxAmount,
      isWinning: true,
      isRetracted: false,
      retractedAt: null,
      ipAddress: '127.0.0.1',
      userAgent: 'auto-bid-engine',
    });

    const saved = await this._bidEntityRepository.save(autoBid);
    await this._bidEntityRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: false })
      .where('auction_id = :auctionId', { auctionId })
      .andWhere('id != :bidId', { bidId: saved.id })
      .execute();

    challenger.lastTriggeredAt = new Date();
    await this._autoBidRepository.save(challenger);
    await this._auctionRepository.updateCurrentPrice(
      triggerBid.auction.id,
      saved.amount,
      challenger.bidder.id,
    );

    return saved;
  }

  resolveAutoBidConflict(
    baseAmount: number,
    challengerMaxAmount: number,
    increment: number,
    incumbentMaxAmount?: number | null,
  ): number {
    if (incumbentMaxAmount === undefined || incumbentMaxAmount === null) {
      return Math.min(challengerMaxAmount, baseAmount + increment);
    }

    if (challengerMaxAmount === incumbentMaxAmount) {
      return challengerMaxAmount;
    }

    if (challengerMaxAmount > incumbentMaxAmount) {
      return Math.min(challengerMaxAmount, incumbentMaxAmount + increment);
    }

    return Math.min(incumbentMaxAmount, challengerMaxAmount + increment);
  }
}
