import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';

import { Auction } from '../../domain/entities/auction.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { ItemStatus } from '../../domain/enums/item-status.enum';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class CleanupScheduler {
  private readonly _logger = new Logger(CleanupScheduler.name);
  private readonly _auctionRepository: Repository<Auction>;
  private readonly _transactionRepository: Repository<Transaction>;

  constructor(
    private readonly _notificationRepository: NotificationRepository,
    private readonly _dataSource: DataSource,
  ) {
    this._auctionRepository = _dataSource.getRepository(Auction);
    this._transactionRepository = _dataSource.getRepository(Transaction);
  }

  @Cron('0 15 2 * * *')
  async cleanupNotificationsAndHolds(): Promise<void> {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const removed = await this._notificationRepository.deleteOlderThan(cutoff);

    const staleHoldCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleHolds = await this._transactionRepository.find({
      where: {
        type: TransactionType.BID_HOLD,
        status: TransactionStatus.PENDING,
      },
      order: { createdAt: 'ASC' },
    });

    for (const hold of staleHolds) {
      if (hold.createdAt > staleHoldCutoff) {
        continue;
      }

      hold.status = TransactionStatus.REVERSED;
      await this._transactionRepository.save(hold);
    }

    this._logger.log(`Cleanup completed notifications=${removed} staleHolds=${staleHolds.length}`);
  }

  @Cron('0 0 3 * * *')
  async archiveOldEndedAuctions(): Promise<void> {
    const retentionCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const endedAuctions = await this._auctionRepository.find({
      where: {
        status: AuctionStatus.ENDED,
      },
      relations: {
        item: true,
      },
      order: { endTime: 'ASC' },
    });

    let archived = 0;
    for (const auction of endedAuctions) {
      if (auction.endTime > retentionCutoff) {
        continue;
      }

      auction.item.status = ItemStatus.ARCHIVED;
      await this._auctionRepository.save(auction);
      archived += 1;
    }

    this._logger.log(`Archived auctions=${archived}`);
  }
}
