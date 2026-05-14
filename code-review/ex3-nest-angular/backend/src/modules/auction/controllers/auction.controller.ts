import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AuctionRepository } from '../../../infrastructure/repositories/auction.repository';
import { BidService } from '../../bid/bid.service';
import { PaymentService } from '../../payment/payment.service';
import { CreateAuctionDto } from '../dto/create-auction.dto';
import { SearchAuctionDto } from '../dto/search-auction.dto';
import { UpdateAuctionDto } from '../dto/update-auction.dto';
import { AuctionService } from '../auction.service';

@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly _auctionService: AuctionService,
    private readonly _bidService: BidService,
    private readonly _paymentService: PaymentService,
    private readonly _auctionRepository: AuctionRepository,
  ) {}

  @Get()
  async listAuctions(@Query() query: SearchAuctionDto) {
    return this._auctionService.listAuctions({
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('search')
  async searchAuctions(@Query() query: SearchAuctionDto) {
    return this._auctionService.searchAuctions(
      {
        q: query.q,
        status: query.status,
        type: query.type,
        categorySlug: query.categorySlug,
        sellerId: query.sellerId,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
      },
      { page: query.page, limit: query.limit },
    );
  }

  @Get(':id')
  async getAuction(@Param('id') id: string) {
    return this._auctionService.getAuction(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAuction(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAuctionDto,
  ) {
    return this._auctionService.createAuction(userId, {
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateAuction(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAuctionDto,
  ) {
    return this._auctionService.updateAuction(id, userId, {
      ...dto,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAuction(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this._auctionService.cancelAuction(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publishAuction(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this._auctionService.publishAuction(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelAuction(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this._auctionService.cancelAuction(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/buy-now')
  async buyNow(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    const auction = await this._auctionService.getAuction(id);
    if (!auction.buyNowPrice) {
      return { success: false, message: 'Buy now is not available' };
    }

    return this._paymentService.initiatePayment({
      auctionId: auction.id,
      buyerId: userId,
      sellerId: auction.seller.id,
      amount: auction.buyNowPrice,
    });
  }

  @Post(':id/watch')
  async watchAuction(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this._auctionService.addWatcher(id, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unwatch')
  async unwatchAuction(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this._auctionService.removeWatcher(id, userId);
    return { success: true };
  }

  @Get(':id/bids')
  async getAuctionBids(@Param('id') id: string, @Query('page') page?: string) {
    return this._bidService.getBidHistory(id, {
      page: Number(page ?? 1),
      limit: 50,
    });
  }

  @Get(':id/stats')
  async getAuctionStats(@Param('id') id: string) {
    const auction = await this._auctionService.getAuction(id);
    const bidCount = await this._bidService.getBidHistory(id, { page: 1, limit: 1 });
    const sellerStats = await this._auctionRepository.getAuctionStats(auction.seller.id);

    return {
      auctionId: id,
      watcherCount: auction.watcherCount,
      viewCount: auction.viewCount,
      bidCount: bidCount.total,
      sellerStats,
    };
  }
}
