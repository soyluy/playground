import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { BidPlacedEvent } from '../../../domain/events/bid-placed.event';
import { OutbidEvent } from '../../../domain/events/outbid.event';
import { BidRepository } from '../../../infrastructure/repositories/bid.repository';
import { NotificationService } from '../../notification/notification.service';
import { WalletService } from '../../wallet/wallet.service';
import { AutoBidService } from '../auto-bid.service';

@Injectable()
export class BidEventListener {
  private readonly _logger = new Logger(BidEventListener.name);

  constructor(
    private readonly _autoBidService: AutoBidService,
    private readonly _notificationService: NotificationService,
    private readonly _walletService: WalletService,
    private readonly _bidRepository: BidRepository,
  ) {}

  @OnEvent('bid.placeed')
  async onBidPlaced(event: BidPlacedEvent): Promise<void> {
    await this._notificationService.sendBidPlacedNotification(
      event.bidderId,
      event.auctionId,
      event.amount,
    );

    if (event.previousWinningBidderId) {
      await this._notificationService.sendOutbidNotification(
        event.previousWinningBidderId,
        event.auctionId,
        event.amount,
      );
    }

    await this._autoBidService.triggerAutoBid(event.auctionId, event.bidId);
    this._logger.debug(`Processed bid placed ${event.bidId}`);
  }

  @OnEvent('bid.outbid')
  async onOutbid(event: OutbidEvent): Promise<void> {
    await this._notificationService.sendOutbidNotification(
      event.previousBidderId,
      event.auctionId,
      event.newAmount,
    );

    const highestBid = await this._bidRepository.findHighestBid(event.auctionId);
    const heldAmount = highestBid?.amount ?? event.previousAmount;
    await this._walletService.releaseFunds(
      event.previousBidderId,
      heldAmount,
      `outbid:${event.auctionId}:${event.newBidderId}`,
    );

    this._logger.debug(
      `Outbid processed previous=${event.previousBidderId} new=${event.newBidderId}`,
    );
  }
}
