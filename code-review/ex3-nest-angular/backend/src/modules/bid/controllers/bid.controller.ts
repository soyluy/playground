import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AutoBidService } from '../auto-bid.service';
import { BidService } from '../bid.service';
import { PlaceBidDto } from '../dto/place-bid.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BidController {
  constructor(
    private readonly _bidService: BidService,
    private readonly _autoBidService: AutoBidService,
  ) {}

  @Post('auctions/:id/bids')
  async placeBid(
    @Param('id') auctionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: PlaceBidDto,
  ) {
    return this._bidService.placeBid(auctionId, userId, dto.amount, {
      ipAddress: dto.ipAddress ?? '127.0.0.1',
      userAgent: dto.userAgent ?? null,
    });
  }

  @Get('auctions/:id/bids')
  async getAuctionBids(
    @Param('id') auctionId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this._bidService.getBidHistory(auctionId, {
      page: Number(page ?? 1),
      limit: Number(limit ?? 20),
    });
  }

  @Get('users/me/bids')
  async getMyBids(@CurrentUser('sub') userId: string, @Query('auctionId') auctionId?: string) {
    if (auctionId) {
      return this._bidService.getUserBidsForAuction(auctionId, userId);
    }

    return this._bidService.getUserBidsForAuction('', userId);
  }

  @Delete('bids/:id')
  async retractBid(@Param('id') bidId: string, @CurrentUser('sub') userId: string) {
    return this._bidService.retractBid(bidId, userId);
  }

  @Post('auctions/:id/auto-bid')
  async setAutoBid(
    @Param('id') auctionId: string,
    @CurrentUser('sub') userId: string,
    @Body('maxAmount') maxAmount: number,
  ) {
    return this._autoBidService.setAutoBid(auctionId, userId, maxAmount);
  }

  @Delete('auctions/:id/auto-bid')
  async deleteAutoBid(@Param('id') auctionId: string, @CurrentUser('sub') userId: string) {
    await this._autoBidService.cancelAutoBid(auctionId, userId);
    return { success: true };
  }
}
