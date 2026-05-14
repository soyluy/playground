import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AuctionStatus } from '../../../domain/enums/auction-status.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { AuctionRepository } from '../../../infrastructure/repositories/auction.repository';
import { TransactionRepository } from '../../../infrastructure/repositories/transaction.repository';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { AuctionService } from '../../auction/auction.service';
import { UserService } from '../../user/user.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminController {
  constructor(
    private readonly _userService: UserService,
    private readonly _auctionService: AuctionService,
    private readonly _userRepository: UserRepository,
    private readonly _auctionRepository: AuctionRepository,
    private readonly _transactionRepository: TransactionRepository,
  ) {}

  @Get('stats')
  async getStats() {
    const [totalUsers, activeAuctions, bannedUsers] = await Promise.all([
      this._userRepository.count(),
      this._auctionRepository.count({ where: { status: AuctionStatus.ACTIVE } }),
      this._userRepository.count({ where: { isBanned: true } }),
    ]);

    return {
      totalUsers,
      activeAuctions,
      bannedUsers,
    };
  }

  @Get('auctions')
  async getAuctions(@Query('status') status?: AuctionStatus) {
    if (status) {
      return this._auctionRepository.findByStatus(status);
    }
    return this._auctionRepository.searchAuctions({}, { page: 1, limit: 100 });
  }

  @Get('users')
  async getUsers(@Query('q') q?: string) {
    if (q) {
      return this._userRepository.searchByName(q, 100);
    }

    return this._userRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  @Post('users/:id/ban')
  async banUser(@Param('id') userId: string) {
    return this._userService.banUser(userId);
  }

  @Post('users/:id/unban')
  async unbanUser(@Param('id') userId: string) {
    return this._userService.unbanUser(userId);
  }

  @Post('auctions/:id/force-end')
  async forceEndAuction(@Param('id') auctionId: string) {
    return this._auctionService.processAuctionEnd(auctionId, new Date());
  }

  @Post('auctions/:id/cancel')
  async cancelAuction(@Param('id') auctionId: string) {
    const auction = await this._auctionService.getAuction(auctionId);
    return this._auctionService.cancelAuction(auction.id, auction.seller.id);
  }

  @Get('reports/revenue')
  async getRevenueReport() {
    const completedPayments = await this._transactionRepository.find({
      where: { status: 'COMPLETED' as never },
      take: 1000,
      order: { createdAt: 'DESC' },
    });

    const revenue = completedPayments.reduce((sum, tx) => sum + Number(tx.amount), 0);
    return {
      revenue,
      transactionCount: completedPayments.length,
    };
  }

  @Get('reports/activity')
  async getActivityReport() {
    const [activeAuctions, endedAuctions, bannedUsers] = await Promise.all([
      this._auctionRepository.count({ where: { status: AuctionStatus.ACTIVE } }),
      this._auctionRepository.count({ where: { status: AuctionStatus.ENDED } }),
      this._userRepository.count({ where: { isBanned: true } }),
    ]);

    return {
      activeAuctions,
      endedAuctions,
      bannedUsers,
      generatedAt: new Date().toISOString(),
    };
  }
}
