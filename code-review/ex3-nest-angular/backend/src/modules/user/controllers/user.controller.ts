import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../../notification/notification.service';
import { DepositDto } from '../dto/deposit.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserService } from '../user.service';
import { WatchlistRepository } from '../../../infrastructure/repositories/watchlist.repository';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _watchlistRepository: WatchlistRepository,
    private readonly _notificationService: NotificationService,
  ) {}

  @Get()
  async getMe(@CurrentUser('sub') userId: string) {
    return this._userService.getProfile(userId);
  }

  @Patch()
  async updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this._userService.updateProfile(userId, dto);
  }

  @Get('auctions')
  async getMyAuctions(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this._userService.getUserAuctions(userId, {
      limit: Number(limit ?? 20),
      offset: Number(offset ?? 0),
    });
  }

  @Get('bids')
  async getMyBids(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this._userService.getUserBids(userId, {
      limit: Number(limit ?? 20),
      offset: Number(offset ?? 0),
    });
  }

  @Get('transactions')
  async getMyTransactions(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this._userService.getUserTransactions(userId, {
      limit: Number(limit ?? 20),
      offset: Number(offset ?? 0),
    });
  }

  @Get('watchlist')
  async getMyWatchlist(@CurrentUser('sub') userId: string) {
    return this._watchlistRepository.findByUser(userId);
  }

  @Get('notifications')
  async getMyNotifications(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    return this._notificationService.getNotifications(userId ?? '', Number(limit ?? 50));
  }

  @Post('deposit')
  async deposit(@CurrentUser('sub') userId: string, @Body() dto: DepositDto) {
    const balance = await this._userService.depositBalance(
      userId,
      dto.amount,
      dto.reference,
      dto.description,
    );
    return { balance };
  }

  @Post('withdraw')
  async withdraw(@CurrentUser('sub') userId: string, @Body() dto: DepositDto) {
    const balance = await this._userService.withdrawBalance(
      userId,
      dto.amount,
      dto.reference,
      dto.description,
    );
    return { balance };
  }
}
