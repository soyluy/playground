import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Auction } from '../../domain/entities/auction.entity';
import { Bid } from '../../domain/entities/bid.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { AuctionRepository } from '../../infrastructure/repositories/auction.repository';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';
import { PaymentGatewayClient } from '../../infrastructure/external/payment-gateway.client';
import { NotificationService } from '../notification/notification.service';
import { WalletService } from '../wallet/wallet.service';

type PaymentRecord = {
  paymentIntentId: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'initiated' | 'authorized' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PaymentService {
  private readonly _auctionEntityRepository: Repository<Auction>;
  private readonly _bidEntityRepository: Repository<Bid>;
  private readonly _payments = new Map<string, PaymentRecord>();

  constructor(
    private readonly _walletService: WalletService,
    private readonly _notificationService: NotificationService,
    private readonly _paymentGatewayClient: PaymentGatewayClient,
    private readonly _auctionRepository: AuctionRepository,
    private readonly _bidRepository: BidRepository,
    private readonly _transactionRepository: TransactionRepository,
    private readonly _dataSource: DataSource,
  ) {
    this._auctionEntityRepository = _dataSource.getRepository(Auction);
    this._bidEntityRepository = _dataSource.getRepository(Bid);
  }

  async initiatePayment(input: {
    auctionId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency?: string;
  }): Promise<{ paymentIntentId: string; clientSecret: string }> {
    if (input.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const auction = await this._auctionRepository.findById(input.auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const intent = await this._paymentGatewayClient.createPaymentIntent({
      amount: input.amount,
      currency: input.currency ?? 'USD',
      reference: `auction:${input.auctionId}:buyer:${input.buyerId}`,
    });

    this._payments.set(intent.id, {
      paymentIntentId: intent.id,
      auctionId: input.auctionId,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      amount: input.amount,
      status: 'initiated',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.clientSecret,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<void> {
    const payment = this._payments.get(paymentIntentId);
    if (!payment) {
      throw new NotFoundException('Payment intent not found');
    }
    if (payment.status === 'completed') {
      return;
    }

    const result = await this._paymentGatewayClient.charge({
      paymentIntentId,
      amount: payment.amount,
    });

    if (result.status !== 'succeeded') {
      payment.status = 'failed';
      payment.updatedAt = new Date();
      await this.handleFailedPayment(payment.auctionId, payment.buyerId, paymentIntentId);
      return;
    }

    payment.status = 'completed';
    payment.updatedAt = new Date();
    await this.processWinnerPayment(payment.auctionId, payment.buyerId, paymentIntentId);
  }

  async refundPayment(paymentIntentId: string, reason?: string): Promise<void> {
    const payment = this._payments.get(paymentIntentId);
    if (!payment) {
      throw new NotFoundException('Payment intent not found');
    }
    if (payment.status !== 'completed') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const refundResult = await this._paymentGatewayClient.refund({
      paymentIntentId,
      amount: payment.amount,
      reason,
    });

    if (refundResult.status !== 'succeeded') {
      throw new BadRequestException('Refund failed');
    }

    payment.status = 'refunded';
    payment.updatedAt = new Date();
    await this._walletService.processRefund(
      payment.buyerId,
      payment.amount,
      `refund:${paymentIntentId}`,
      'Payment refunded',
    );
  }

  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    const payment = this._payments.get(paymentIntentId);
    if (!payment) {
      throw new NotFoundException('Payment intent not found');
    }

    const gatewayStatus = await this._paymentGatewayClient.getStatus(paymentIntentId);
    return gatewayStatus.status;
  }

  async handleWebhook(payload: {
    paymentIntentId: string;
    eventType: 'payment.succeeded' | 'payment.failed' | 'payment.refunded';
    signature?: string;
  }): Promise<void> {
    const payment = this._payments.get(payload.paymentIntentId);
    if (!payment) {
      return;
    }

    if (payload.eventType === 'payment.succeeded') {
      await this.confirmPayment(payload.paymentIntentId);
      return;
    }

    if (payload.eventType === 'payment.refunded') {
      await this.refundPayment(payload.paymentIntentId, 'Gateway webhook');
      return;
    }

    payment.status = 'failed';
    payment.updatedAt = new Date();
    await this.handleFailedPayment(payment.auctionId, payment.buyerId, payload.paymentIntentId);
  }

  async processWinnerPayment(
    auctionId: string,
    winnerId: string,
    paymentIntentId: string,
  ): Promise<void> {
    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    if (auction.winnerId !== winnerId) {
      throw new BadRequestException('Winner mismatch');
    }

    const amount = auction.finalPrice ?? auction.currentPrice;
    await this._walletService.processPayment(
      winnerId,
      auction.seller.id,
      amount,
      `auction-payment:${auctionId}:${paymentIntentId}`,
    );
    await this._notificationService.sendPaymentNotification(
      winnerId,
      paymentIntentId,
      amount,
      'completed',
    );
  }

  async releaseSellerFunds(auctionId: string): Promise<void> {
    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    if (!auction.winnerId) {
      return;
    }

    const payment = Array.from(this._payments.values()).find(
      (entry) =>
        entry.auctionId === auctionId &&
        entry.status === 'completed' &&
        entry.buyerId === auction.winnerId,
    );
    if (!payment) {
      return;
    }

    const amount = auction.finalPrice ?? payment.amount;
    await this._transactionRepository.save(
      this._transactionRepository.create({
        user: auction.seller,
        type: TransactionType.DEPOSIT,
        amount,
        balanceBefore: auction.seller.balance,
        balanceAfter: auction.seller.balance + amount,
        reference: `seller-release:${auction.id}:${payment.paymentIntentId}`,
        description: 'Seller payout release',
        status: TransactionStatus.COMPLETED,
      }),
    );
  }

  async handleFailedPayment(
    auctionId: string,
    failedBuyerId: string,
    paymentIntentId: string,
  ): Promise<void> {
    const auction = await this._auctionRepository.findById(auctionId);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const bids = await this._bidRepository.findByAuction(auctionId);
    const candidates = bids
      .filter((bid) => !bid.isRetracted && bid.bidder.id !== failedBuyerId)
      .slice(1);

    const nextBidder = candidates[0];
    if (!nextBidder) {
      auction.winnerId = null;
      auction.finalPrice = null;
      await this._auctionEntityRepository.save(auction);
      return;
    }

    auction.winnerId = nextBidder.bidder.id;
    auction.finalPrice = nextBidder.amount;
    await this._auctionEntityRepository.save(auction);

    await this._bidEntityRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: false })
      .where('auction_id = :auctionId', { auctionId })
      .execute();

    await this._bidEntityRepository
      .createQueryBuilder()
      .update(Bid)
      .set({ isWinning: true })
      .where('id = :bidId', { bidId: nextBidder.id })
      .execute();

    await this._notificationService.sendPaymentNotification(
      failedBuyerId,
      paymentIntentId,
      auction.finalPrice ?? 0,
      'failed',
    );
  }
}
