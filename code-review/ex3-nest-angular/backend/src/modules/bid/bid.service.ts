import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Auction } from '../../domain/entities/auction.entity';
import { Bid } from '../../domain/entities/bid.entity';
import { User } from '../../domain/entities/user.entity';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { AuctionType } from '../../domain/enums/auction-type.enum';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { AuctionRepository } from '../../infrastructure/repositories/auction.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { AuctionService } from '../auction/auction.service';
import { AutoBidService } from './auto-bid.service';

type PaginationInput = {
  page?: number;
  limit?: number;
};

@Injectable()
export class BidService {
  private readonly _bidEntityRepository: Repository<Bid>;

  constructor(
    private readonly _bidRepository: BidRepository,
    private readonly _auctionRepository: AuctionRepository,
    private readonly _userRepository: UserRepository,
    private readonly _autoBidService: AutoBidService,
    private readonly _auctionService: AuctionService,
    private readonly _dataSource: DataSource,
  ) {
    this._bidEntityRepository = _dataSource.getRepository(Bid);
  }

  async placeBid(
    auctionId: string,
    userId: string,
    amount: number,
    context: { ipAddress: string; userAgent?: string | null },
  ): Promise<Bid> {
    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.validateBid(auction, user, amount);

    const bid = this._bidEntityRepository.create({
      auction,
      bidder: user,
      amount,
      isAutoBid: false,
      maxAutoBidAmount: null,
      isWinning: true,
      isRetracted: false,
      retractedAt: null,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent ?? null,
    });

    const savedBid = await this._bidEntityRepository.save(bid);
    await this._bidEntityRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: false })
      .where('auction_id = :auctionId', { auctionId })
      .andWhere('id != :bidId', { bidId: savedBid.id })
      .execute();

    await this._auctionRepository.updateCurrentPrice(auction.id, amount, user.id);
    await this._auctionService.handleLastMinuteBid(auction.id, savedBid.createdAt);
    await this.processAutoBids(auction.id, savedBid.id);

    return savedBid;
  }

  async retractBid(bidId: string, userId: string): Promise<Bid> {
    const bid = await this._bidEntityRepository.findOne({
      where: { id: bidId },
      relations: { bidder: true, auction: true },
    });
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    if (bid.bidder.id !== userId) {
      throw new BadRequestException('Bid does not belong to user');
    }
    if (bid.auction.status === AuctionStatus.ENDED) {
      throw new BadRequestException('Cannot retract bid after auction end');
    }

    bid.isRetracted = true;
    bid.retractedAt = new Date();
    bid.isWinning = false;
    return this._bidEntityRepository.save(bid);
  }

  async getBidHistory(
    auctionId: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: Bid[]; total: number }> {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    return this._bidRepository.findBidHistory(auctionId, { page, limit });
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    return this._bidRepository.findHighestBid(auctionId);
  }

  async getUserBidsForAuction(auctionId: string, userId: string): Promise<Bid[]> {
    return this._bidEntityRepository.find({
      where: {
        auction: { id: auctionId },
        bidder: { id: userId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async validateBid(auction: Auction, user: User, amount: number): Promise<void> {
    if (user.isBanned) {
      throw new BadRequestException('Banned users cannot place bids');
    }
    if (!user.isVerified) {
      throw new BadRequestException('User must be verified');
    }
    if (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING_SOON) {
      throw new BadRequestException('Auction is not active');
    }
    if (auction.type === AuctionType.DUTCH) {
      if (amount < auction.currentPrice) {
        throw new BadRequestException('Bid amount is below Dutch current price');
      }
      return;
    }

    const minimum = auction.currentPrice + auction.bidIncrement;
    if (amount < minimum) {
      throw new BadRequestException(`Minimum bid is ${minimum}`);
    }
  }

  async processAutoBids(auctionId: string, triggerBidId: string): Promise<void> {
    await this._autoBidService.triggerAutoBid(auctionId, triggerBidId);
  }

  async determineWinner(auctionId: string): Promise<Bid | null> {
    const winningBid = await this._bidRepository.findWinningBid(auctionId);
    if (winningBid) {
      return winningBid;
    }

    return this._bidRepository.findHighestBid(auctionId);
  }
}
