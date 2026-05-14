import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, ILike, In, Repository } from 'typeorm';

import { AuctionItem } from '../../domain/entities/auction-item.entity';
import { Category } from '../../domain/entities/category.entity';
import { User } from '../../domain/entities/user.entity';
import { ItemStatus } from '../../domain/enums/item-status.enum';

type ItemListFilters = {
  status?: ItemStatus[];
  sellerId?: string;
  categoryId?: string;
};

type PaginationInput = {
  limit?: number;
  offset?: number;
};

@Injectable()
export class AuctionItemService {
  private readonly _itemRepository: Repository<AuctionItem>;
  private readonly _categoryRepository: Repository<Category>;
  private readonly _userRepository: Repository<User>;

  constructor(private readonly _dataSource: DataSource) {
    this._itemRepository = _dataSource.getRepository(AuctionItem);
    this._categoryRepository = _dataSource.getRepository(Category);
    this._userRepository = _dataSource.getRepository(User);
  }

  async createItem(
    sellerId: string,
    payload: Omit<AuctionItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'seller' | 'category'> & {
      categoryId: string;
      images?: string[];
    },
  ): Promise<AuctionItem> {
    const seller = await this._userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const category = await this._categoryRepository.findOne({
      where: { id: payload.categoryId, active: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (payload.startingPrice <= 0) {
      throw new BadRequestException('Starting price must be positive');
    }

    const item = this._itemRepository.create({
      ...payload,
      reservePrice: payload.reservePrice ?? null,
      buyNowPrice: payload.buyNowPrice ?? null,
      images: payload.images ?? [],
      seller,
      category,
      status: ItemStatus.DRAFT,
    });

    return this._itemRepository.save(item);
  }

  async updateItem(
    itemId: string,
    sellerId: string,
    payload: Partial<AuctionItem> & { appendImages?: string[]; removeImages?: string[] },
  ): Promise<AuctionItem> {
    const item = await this.getItem(itemId);
    if (item.seller.id !== sellerId) {
      throw new ForbiddenException('You do not own this item');
    }

    if (![ItemStatus.DRAFT, ItemStatus.REJECTED].includes(item.status)) {
      throw new BadRequestException('Item is not editable in current status');
    }

    if (payload.title !== undefined) {
      item.title = payload.title.trim();
    }
    if (payload.description !== undefined) {
      item.description = payload.description;
    }
    if (payload.condition !== undefined) {
      item.condition = payload.condition;
    }
    if (payload.startingPrice !== undefined) {
      item.startingPrice = payload.startingPrice;
    }
    if (payload.reservePrice !== undefined) {
      item.reservePrice = payload.reservePrice;
    }
    if (payload.buyNowPrice !== undefined) {
      item.buyNowPrice = payload.buyNowPrice;
    }
    if (payload.weight !== undefined) {
      item.weight = payload.weight;
    }
    if (payload.dimensions !== undefined) {
      item.dimensions = payload.dimensions;
    }

    const images = [...item.images];
    if (payload.appendImages?.length) {
      images.push(...payload.appendImages);
    }
    if (payload.removeImages?.length) {
      item.images = images.filter((img) => !payload.removeImages?.includes(img));
    } else {
      item.images = images;
    }

    return this._itemRepository.save(item);
  }

  async submitForReview(itemId: string, sellerId: string): Promise<AuctionItem> {
    const item = await this.getItem(itemId);
    if (item.seller.id !== sellerId) {
      throw new ForbiddenException('You do not own this item');
    }
    if (item.status !== ItemStatus.DRAFT && item.status !== ItemStatus.REJECTED) {
      throw new BadRequestException('Item cannot be submitted for review');
    }
    if (!item.images.length) {
      throw new BadRequestException('At least one image is required');
    }

    item.status = ItemStatus.PENDING_REVIEW;
    return this._itemRepository.save(item);
  }

  async approveItem(itemId: string): Promise<AuctionItem> {
    const item = await this.getItem(itemId);
    if (item.status !== ItemStatus.PENDING_REVIEW) {
      throw new BadRequestException('Item is not pending review');
    }

    item.status = ItemStatus.APPROVED;
    return this._itemRepository.save(item);
  }

  async rejectItem(itemId: string): Promise<AuctionItem> {
    const item = await this.getItem(itemId);
    if (item.status !== ItemStatus.PENDING_REVIEW) {
      throw new BadRequestException('Item is not pending review');
    }

    item.status = ItemStatus.REJECTED;
    return this._itemRepository.save(item);
  }

  async getItem(itemId: string): Promise<AuctionItem> {
    const item = await this._itemRepository.findOne({
      where: { id: itemId },
      relations: {
        seller: true,
        category: true,
      },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async listItems(
    filters: ItemListFilters = {},
    pagination: PaginationInput = {},
  ): Promise<{ data: AuctionItem[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status?.length) {
      where.status = In(filters.status);
    }
    if (filters.sellerId) {
      where.seller = { id: filters.sellerId };
    }
    if (filters.categoryId) {
      where.category = { id: filters.categoryId };
    }

    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    const offset = Math.max(0, pagination.offset ?? 0);

    const [data, total] = await this._itemRepository.findAndCount({
      where,
      relations: {
        seller: true,
        category: true,
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { data, total };
  }

  async searchItems(
    query: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: AuctionItem[]; total: number }> {
    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    const offset = Math.max(0, pagination.offset ?? 0);

    const [data, total] = await this._itemRepository.findAndCount({
      where: [{ title: ILike(`%${query}%`) }, { description: ILike(`%${query}%`) }],
      relations: {
        seller: true,
        category: true,
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { data, total };
  }

  async getSellerItems(
    sellerId: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: AuctionItem[]; total: number }> {
    return this.listItems({ sellerId }, pagination);
  }
}
