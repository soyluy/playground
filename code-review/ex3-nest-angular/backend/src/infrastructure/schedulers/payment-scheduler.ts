import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { AuctionStatus } from '../../domain/enums/auction-status.enum';
import { AuctionRepository } from '../repositories/auction.repository';
import { PaymentService } from '../../modules/payment/payment.service';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class PaymentScheduler {
  private readonly _logger = new Logger(PaymentScheduler.name);

  constructor(
    private readonly _auctionRepository: AuctionRepository,
    private readonly _paymentService: PaymentService,
    private readonly _transactionRepository: TransactionRepository,
  ) {}

  @Cron('*/5 * * * *')
  async processPendingWinnerPayments(): Promise<void> {
    const endedAuctions = await this._auctionRepository.findByStatus(AuctionStatus.ENDED);
    const now = Date.now();

    for (const auction of endedAuctions) {
      if (!auction.winnerId || !auction.finalPrice) {
        continue;
      }

      const ageMs = now - auction.endTime.getTime();
      if (ageMs < 5 * 60 * 1000) {
        continue;
      }

      const existing = await this._transactionRepository.findByReference(
        `auction-payment:${auction.id}`,
      );
      if (existing.length) {
        continue;
      }

      const intent = await this._paymentService.initiatePayment({
        auctionId: auction.id,
        buyerId: auction.winnerId,
        sellerId: auction.seller.id,
        amount: auction.finalPrice,
      });
      await this._paymentService.confirmPayment(intent.paymentIntentId);
    }
  }

  @Cron('0 */30 * * * *')
  async releaseSellerFundsAfterConfirmation(): Promise<void> {
    const endedAuctions = await this._auctionRepository.findByStatus(AuctionStatus.ENDED);
    const now = Date.now();

    for (const auction of endedAuctions) {
      const elapsed = now - auction.endTime.getTime();
      if (elapsed < 24 * 60 * 60 * 1000) {
        continue;
      }

      await this._paymentService.releaseSellerFunds(auction.id);
    }
  }

  @Cron('0 */10 * * * *')
  async handlePaymentTimeoutAndRelisting(): Promise<void> {
    const endedAuctions = await this._auctionRepository.findByStatus(AuctionStatus.ENDED);
    const now = Date.now();

    for (const auction of endedAuctions) {
      if (!auction.winnerId) {
        continue;
      }

      const elapsed = now - auction.endTime.getTime();
      if (elapsed < 30 * 60 * 1000) {
        continue;
      }

      const hasPayment = (
        await this._transactionRepository.findByReference(`auction-payment:${auction.id}`)
      ).length;
      if (hasPayment > 0) {
        continue;
      }

      await this._paymentService.handleFailedPayment(auction.id, auction.winnerId, 'timeout');
      this._logger.warn(`Payment timeout handled for auction ${auction.id}`);
    }
  }
}
