import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(Notification, _dataSource.createEntityManager());
  }

  async findByUser(userId: string, limit: number = 100): Promise<Notification[]> {
    return this.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.find({
      where: {
        user: { id: userId },
        isRead: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.update({ id: notificationId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();

    return result.affected ?? 0;
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }

  async deleteOlderThan(cutoff: Date): Promise<number> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(Notification)
      .where('created_at < :cutoff', { cutoff })
      .execute();

    return result.affected ?? 0;
  }
}
