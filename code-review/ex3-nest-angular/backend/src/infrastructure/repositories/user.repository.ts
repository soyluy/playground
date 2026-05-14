import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';

import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(User, _dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async findSellers(limit: number = 50): Promise<User[]> {
    return this.find({
      where: { role: UserRole.SELLER, isBanned: false },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBannedUsers(): Promise<User[]> {
    return this.find({
      where: { isBanned: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async searchByName(query: string, limit: number = 25): Promise<User[]> {
    return this.find({
      where: [{ firstName: ILike(`%${query}%`) }, { lastName: ILike(`%${query}%`) }],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateBalance(userId: string, nextBalance: number): Promise<void> {
    await this.update({ id: userId }, { balance: nextBalance });
  }

  async findTopSellers(limit: number = 10): Promise<User[]> {
    const sellers = await this.find({
      where: { role: UserRole.SELLER, isBanned: false },
      take: 100,
    });

    const scores: Array<{ user: User; soldCount: number }> = [];
    for (const seller of sellers) {
      const soldCount = await this._dataSource
        .getRepository('auctions')
        .createQueryBuilder('auction')
        .where('auction.seller_id = :sellerId', { sellerId: seller.id })
        .andWhere('auction.status = :ended', { ended: 'ENDED' })
        .getCount();

      scores.push({ user: seller, soldCount });
    }

    return scores
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, limit)
      .map((entry) => entry.user);
  }
}
