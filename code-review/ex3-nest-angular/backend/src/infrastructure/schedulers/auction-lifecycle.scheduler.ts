import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuctionEndedEvent } from '../../domain/events/auction-ended.event';
import { AuctionStartedEvent } from '../../domain/events/auction-started.event';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { AuctionType } from '../../domain/enums/auction-type.enum';
import { AuctionRepository } from '../repositories/auction.repository';
import { WatchlistRepository } from '../repositories/watchlist.repository';
import { AuctionService } from '../../modules/auction/auction.service';
import { NotificationService } from '../../modules/notification/notification.service';

@Injectable()
export class AuctionLifecycleScheduler {
  private readonly _logger = new Logger(AuctionLifecycleScheduler.name);

  constructor(
    private readonly _auctionRepository: AuctionRepository,
    private readonly _auctionService: AuctionService,
    private readonly _watchlistRepository: WatchlistRepository,
    private readonly _notificationService: NotificationService,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async startScheduledAuctions(): Promise<void> {
    const scheduled = await this._auctionRepository.findByStatus(AuctionStatus.SCHEDULED);
    const now = new Date();

    for (const auction of scheduled) {
      if (auction.startTime > now) {
        continue;
      }

      const started = await this._auctionService.startAuction(auction.id, now);
      this._eventEmitter.emit(
        'auction.started',
        new AuctionStartedEvent(started.id, started.seller.id, started.type, now),
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async endExpiredAuctions(): Promise<void> {
    const expired = await this._auctionRepository.findExpiredActive(new Date());

    for (const auction of expired) {
      const ended = await this._auctionService.endAuction(auction.id, new Date());
      this._eventEmitter.emit(
        'auction.ended',
        new AuctionEndedEvent(ended, ended.winnerId, ended.finalPrice, new Date()),
      );
    }
  }

  @Cron('*/1 * * * *')
  async notifyEndingSoon1m(): Promise<void> {
    await this.notifyEndingSoon(1);
  }

  @Cron('*/5 * * * *')
  async notifyEndingSoon5m(): Promise<void> {
    await this.notifyEndingSoon(5);
  }

  @Cron('*/15 * * * *')
  async notifyEndingSoon15m(): Promise<void> {
    await this.notifyEndingSoon(15);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateDutchAuctionPrices(): Promise<void> {
    const activeDutch = await this._auctionRepository.findByStatus(AuctionStatus.ACTIVE);

    for (const auction of activeDutch) {
      if (auction.type !== AuctionType.DUTCH) {
        continue;
      }

      const nextPrice = Number((auction.currentPrice * 0.98).toFixed(2));
      auction.currentPrice = Math.max(nextPrice, auction.reservePrice ?? auction.startingPrice * 0.5);
      await this._auctionRepository.save(auction);
      this._logger.debug(`Updated Dutch price auction=${auction.id} price=${auction.currentPrice}`);
    }
  }

  private async notifyEndingSoon(minutes: number): Promise<void> {
    const activeAuctions = await this._auctionRepository.findEndingSoon(minutes);
    for (const auction of activeAuctions) {
      const watchlist = await this._watchlistRepository.findByAuction(auction.id);
      for (const entry of watchlist) {
        if (!entry.notifyOnEndingSoon) {
          continue;
        }

        await this._notificationService.sendAuctionStartingNotification(
          entry.user.id,
          auction.id,
          auction.endTime,
        );
      }
    }
  }
}
