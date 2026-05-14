import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AuctionItem } from '../../domain/entities/auction-item.entity';
import { Category } from '../../domain/entities/category.entity';
import { ItemStatus } from '../../domain/enums/item-status.enum';

@Injectable()
export class CategoryService {
  private readonly _categoryRepository: Repository<Category>;
  private readonly _itemRepository: Repository<AuctionItem>;

  constructor(private readonly _dataSource: DataSource) {
    this._categoryRepository = _dataSource.getRepository(Category);
    this._itemRepository = _dataSource.getRepository(AuctionItem);
  }

  async createCategory(payload: {
    name: string;
    slug: string;
    description?: string | null;
    parentCategoryId?: string | null;
  }): Promise<Category> {
    const existing = await this._categoryRepository.findOne({
      where: { slug: payload.slug },
    });
    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    const category = this._categoryRepository.create({
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      description: payload.description ?? null,
      active: true,
    });

    if (payload.parentCategoryId) {
      const parent = await this.getCategory(payload.parentCategoryId);
      category.parentCategory = parent;
    }

    return this._categoryRepository.save(category);
  }

  async updateCategory(
    categoryId: string,
    patch: Partial<Pick<Category, 'name' | 'slug' | 'description' | 'active'>> & {
      parentCategoryId?: string | null;
    },
  ): Promise<Category> {
    const category = await this.getCategory(categoryId);

    if (patch.slug && patch.slug !== category.slug) {
      const existing = await this._categoryRepository.findOne({ where: { slug: patch.slug } });
      if (existing) {
        throw new BadRequestException('Category slug already exists');
      }
      category.slug = patch.slug.toLowerCase().trim();
    }

    if (patch.name !== undefined) {
      category.name = patch.name.trim();
    }
    if (patch.description !== undefined) {
      category.description = patch.description;
    }
    if (patch.active !== undefined) {
      category.active = patch.active;
    }
    if (patch.parentCategoryId !== undefined) {
      category.parentCategory = patch.parentCategoryId
        ? await this.getCategory(patch.parentCategoryId)
        : null;
    }

    return this._categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.getCategory(categoryId);
    const itemsCount = await this._itemRepository.count({
      where: { category: { id: category.id } },
    });
    if (itemsCount > 0) {
      throw new BadRequestException('Category contains items');
    }

    await this._categoryRepository.remove(category);
  }

  async getCategory(categoryId: string): Promise<Category> {
    const category = await this._categoryRepository.findOne({
      where: { id: categoryId },
      relations: {
        parentCategory: true,
        children: true,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async listCategories(activeOnly: boolean = true): Promise<Category[]> {
    return this._categoryRepository.find({
      where: activeOnly ? { active: true } : {},
      order: { name: 'ASC' },
    });
  }

  async getCategoryTree(): Promise<Category[]> {
    const categories = await this._categoryRepository.find({
      where: { active: true },
      relations: {
        parentCategory: true,
        children: true,
      },
      order: { name: 'ASC' },
    });

    return categories.filter((category) => !category.parentCategory);
  }

  async getItemsByCategory(
    categoryId: string,
    includeChildCategories: boolean = true,
  ): Promise<AuctionItem[]> {
    const category = await this.getCategory(categoryId);
    const categoryIds = [category.id];

    if (includeChildCategories) {
      const childIds = category.children.map((child) => child.id);
      categoryIds.push(...childIds);
    }

    return this._itemRepository.find({
      where: {
        category: categoryIds.map((id) => ({ id })),
        status: ItemStatus.APPROVED,
      },
      relations: {
        seller: true,
        category: true,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
