import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AuctionEndedEvent } from '../../../domain/events/auction-ended.event';
import { AuctionExtendedEvent } from '../../../domain/events/auction-extended.event';
import { AuctionStartedEvent } from '../../../domain/events/auction-started.event';
import { BuyNowPurchasedEvent } from '../../../domain/events/buy-now-purchased.event';
import { PaymentCompletedEvent } from '../../../domain/events/payment-completed.event';
import { ReserveMetEvent } from '../../../domain/events/reserve-met.event';
import { AuctionType } from '../../../domain/enums/auction-type.enum';
import { NotificationService } from '../../notification/notification.service';
import { PaymentService } from '../../payment/payment.service';
import { WalletService } from '../../wallet/wallet.service';

@Injectable()
export class AuctionEventListener {
  private readonly _logger = new Logger(AuctionEventListener.name);

  constructor(
    private readonly _notificationService: NotificationService,
    private readonly _walletService: WalletService,
    private readonly _paymentService: PaymentService,
  ) {}

  @OnEvent('auction.started')
  async onAuctionStarted(event: AuctionStartedEvent): Promise<void> {
    this.emitSocket('auction:started', {
      auctionId: event.auctionId,
      startedAt: event.startedAt.toISOString(),
      type: event.type,
    });
  }

  @OnEvent('auction.ended')
  async onAuctionEnded(event: AuctionEndedEvent): Promise<void> {
    if (event.winnerId) {
      await this._notificationService.sendAuctionWonNotification(
        event.winnerId,
        event.auction.id,
        event.finalPrice ?? event.auction.currentPrice,
      );
    }

    await this._notificationService.sendAuctionEndedNotification(
      event.auction.seller.id,
      event.auction.id,
      event.finalPrice,
    );

    this.emitSocket('auction:ended', {
      auctionId: event.auction.id,
      winnerId: event.winnerId,
      finalPrice: event.finalPrice,
    });
  }

  @OnEvent('auction.extended')
  async onAuctionExtended(event: AuctionExtendedEvent): Promise<void> {
    this.emitSocket('auction:extended', {
      auctionId: event.auctionId,
      previousEndTime: event.previousEndTime.toISOString(),
      newEndTime: event.newEndTime.toISOString(),
    });
  }

  @OnEvent('auction.buy-now.purchased')
  async onBuyNowPurchased(event: BuyNowPurchasedEvent): Promise<void> {
    await this._paymentService.initiatePayment({
      auctionId: event.auctionId,
      buyerId: event.buyerId,
      sellerId: event.sellerId,
      amount: event.buyNowPrice,
      currency: 'USD',
    });

    this.emitSocket('auction:buy-now', {
      auctionId: event.auctionId,
      buyerId: event.buyerId,
      amount: event.buyNowPrice,
    });
  }

  @OnEvent('auction.reserve.met')
  async onReserveMet(event: ReserveMetEvent): Promise<void> {
    if (event.type !== AuctionType.RESERVE) {
      await this._notificationService.sendBidPlacedNotification(
        event.auctionId,
        event.auctionId,
        event.amount,
      );
      return;
    }

    this.emitSocket('auction:reserve-met', {
      auctionId: event.auctionId,
      bidId: event.bidId,
      reservePrice: event.reservePrice,
      amount: event.amount,
    });
  }

  @OnEvent('payment.completed')
  async onPaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    await this._notificationService.sendPaymentNotification(
      event.sellerId,
      event.paymentIntentId,
      event.amount,
      'completed',
    );
    await this._walletService.releaseFunds(
      event.buyerId,
      event.amount,
      `release:${event.paymentIntentId}`,
    );

    this.emitSocket('payment:completed', {
      auctionId: event.auctionId,
      buyerId: event.buyerId,
      sellerId: event.sellerId,
      amount: event.amount,
    });
  }

  private emitSocket(event: string, payload: Record<string, unknown>): void {
    this._logger.debug(`socket emit ${event} payload=${JSON.stringify(payload)}`);
  }
}
