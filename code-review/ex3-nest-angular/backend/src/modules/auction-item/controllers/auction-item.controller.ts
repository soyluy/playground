import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ItemStatus } from '../../../domain/enums/item-status.enum';
import { AuctionItemService } from '../auction-item.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';

@Controller('items')
export class AuctionItemController {
  constructor(private readonly _auctionItemService: AuctionItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createItem(@CurrentUser('sub') userId: string, @Body() dto: CreateItemDto) {
    return this._auctionItemService.createItem(userId, dto as never);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateItem(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this._auctionItemService.updateItem(id, userId, dto as never);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteItem(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    await this._auctionItemService.updateItem(id, userId, {
      status: ItemStatus.ARCHIVED,
    } as never);
    return { success: true };
  }

  @Get(':id')
  async getItem(@Param('id') id: string) {
    return this._auctionItemService.getItem(id);
  }

  @Get()
  async listItems(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (q) {
      return this._auctionItemService.searchItems(q, {
        limit: Number(limit ?? 20),
        offset: Number(offset ?? 0),
      });
    }

    return this._auctionItemService.listItems(
      {},
      {
        limit: Number(limit ?? 20),
        offset: Number(offset ?? 0),
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/me/items')
  async getMyItems(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this._auctionItemService.getSellerItems(userId, {
      limit: Number(limit ?? 20),
      offset: Number(offset ?? 0),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitForReview(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this._auctionItemService.submitForReview(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/approve')
  async approveItem(@Param('id') id: string) {
    return this._auctionItemService.approveItem(id);
  }

  @Post(':id/reject')
  async rejectItem(@Param('id') id: string) {
    return this._auctionItemService.rejectItem(id);
  }
}
