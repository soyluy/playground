import { Injectable } from '@nestjs/common';

import { Auction } from '../../domain/entities/auction.entity';
import { AuctionType } from '../../domain/enums/auction-type.enum';

@Injectable()
export class PricingService {
  calculateMinimumBid(auction: Auction): number {
    if (auction.type === AuctionType.DUTCH) {
      return auction.currentPrice;
    }

    return Number((auction.currentPrice + auction.bidIncrement).toFixed(2));
  }

  calculateBuyerPremium(bidAmount: number): number {
    const premiumRate = bidAmount >= 1000 ? 0.08 : 0.1;
    return Number((bidAmount * premiumRate).toFixed(2));
  }

  calculateSellerFee(
    finalPrice: number,
    auctionType: AuctionType,
    buyerPremium?: number,
  ): number {
    const baseRate = auctionType === AuctionType.BUY_NOW ? 0.06 : 0.07;
    const baseFee = finalPrice * baseRate;

    if (auctionType === AuctionType.RESERVE && buyerPremium) {
      return Number((baseFee * (1 + buyerPremium / finalPrice)).toFixed(2));
    }

    return Number(baseFee.toFixed(2));
  }

  calculateDutchCurrentPrice(auction: Auction, now: Date = new Date()): number {
    if (auction.type !== AuctionType.DUTCH) {
      return auction.currentPrice;
    }

    const durationMs = auction.endTime.getTime() - auction.startTime.getTime();
    if (durationMs <= 0) {
      return auction.currentPrice;
    }

    const elapsedMs = Math.max(0, now.getTime() - auction.startTime.getTime());
    const elapsedMinutes = Math.round(elapsedMs / 60000);
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
    const progress = Math.min(1, elapsedMinutes / durationMinutes);

    const floorPrice = auction.reservePrice ?? auction.startingPrice * 0.5;
    const priceDrop = auction.startingPrice - floorPrice;
    const current = auction.startingPrice - priceDrop * progress;
    return Number(Math.max(current, floorPrice).toFixed(2));
  }

  applyEarlyBirdDiscount(
    amount: number,
    registeredAt: Date,
    auctionStart: Date,
    discountRate: number = 0.03,
  ): number {
    const isEarly = registeredAt.getTime() < auctionStart.getTime() - 7 * 24 * 60 * 60 * 1000;
    if (!isEarly) {
      return amount;
    }

    return Number((amount * (1 - discountRate)).toFixed(2));
  }

  calculateLateFeePenalty(baseAmount: number, daysLate: number): number {
    if (daysLate <= 0) {
      return 0;
    }

    const dailyRate = 0.01;
    const penalty = baseAmount * dailyRate * Math.min(daysLate, 30);
    return Number(penalty.toFixed(2));
  }
}
