import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Notification } from '../../domain/entities/notification.entity';
import { User } from '../../domain/entities/user.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';

@Injectable()
export class NotificationService {
  private readonly _userRepository: Repository<User>;

  constructor(
    private readonly _notificationRepository: NotificationRepository,
    private readonly _dataSource: DataSource,
  ) {
    this._userRepository = _dataSource.getRepository(User);
  }

  async createNotification(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const user = await this._userRepository.findOne({ where: { id: input.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = this._notificationRepository.create({
      user,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      metadata: input.metadata ?? null,
    });

    return this._notificationRepository.save(notification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this._notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this._notificationRepository.markAllAsRead(userId);
  }

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return this._notificationRepository.findByUser(userId, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this._notificationRepository.countUnread(userId);
  }

  async sendBidPlacedNotification(userId: string, auctionId: string, amount: number): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.BID_PLACED,
      title: 'Bid placed',
      message: `Your bid of ${amount.toFixed(2)} has been placed.`,
      metadata: { auctionId, amount },
    });
  }

  async sendOutbidNotification(
    userId: string,
    auctionId: string,
    newAmount: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.OUTBID,
      title: 'You were outbid',
      message: `A higher bid of ${newAmount.toFixed(2)} was placed.`,
      metadata: { auctionId, newAmount },
    });
  }

  async sendAuctionWonNotification(
    userId: string,
    auctionId: string,
    finalPrice: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.AUCTION_WON,
      title: 'Auction won',
      message: `You won the auction with ${finalPrice.toFixed(2)}.`,
      metadata: { auctionId, finalPrice },
    });
  }

  async sendAuctionEndedNotification(
    userId: string,
    auctionId: string,
    finalPrice: number | null,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.AUCTION_ENDED,
      title: 'Auction ended',
      message:
        finalPrice === null
          ? 'Auction ended without a winning bid.'
          : `Auction ended at ${finalPrice.toFixed(2)}.`,
      metadata: { auctionId, finalPrice },
    });
  }

  async sendAuctionStartingNotification(
    userId: string,
    auctionId: string,
    startsAt: Date,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.AUCTION_STARTING,
      title: 'Auction starting soon',
      message: `Auction starts at ${startsAt.toISOString()}.`,
      metadata: { auctionId, startsAt: startsAt.toISOString() },
    });
  }

  async sendPaymentNotification(
    userId: string,
    reference: string,
    amount: number,
    status: 'completed' | 'failed' | 'refunded',
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment update',
      message: `Payment ${reference} is ${status} (${amount.toFixed(2)}).`,
      metadata: { reference, amount, status },
    });
  }

  async sendItemStatusNotification(
    userId: string,
    itemId: string,
    status: 'approved' | 'rejected',
  ): Promise<void> {
    this.createNotification({
      userId,
      type: status === 'approved' ? NotificationType.ITEM_APPROVED : NotificationType.ITEM_REJECTED,
      title: status === 'approved' ? 'Item approved' : 'Item rejected',
      message:
        status === 'approved'
          ? 'Your item passed moderation.'
          : 'Your item did not pass moderation.',
      metadata: { itemId, status },
    });
  }
}
