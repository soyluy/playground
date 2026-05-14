import { Auction, AuctionStatus, AuctionType } from '../models/auction.model';

export function isAuctionActive(auction: Auction, now: Date = new Date()): boolean {
  return (
    auction.status === AuctionStatus.ACTIVE &&
    new Date(auction.startTime) <= now &&
    new Date(auction.endTime) > now
  );
}

export function canPlaceBid(
  auction: Auction,
  amount: number,
  now: Date = new Date(),
): boolean {
  if (!isAuctionActive(auction, now)) {
    return false;
  }

  if (auction.type === AuctionType.DUTCH) {
    return amount >= auction.currentPrice;
  }

  const minBid = getMinimumBid(auction);
  return amount >= minBid;
}

export function canBuyNow(auction: Auction, now: Date = new Date()): boolean {
  if (!isAuctionActive(auction, now)) {
    return false;
  }

  if (auction.buyNowPrice === null) {
    return false;
  }

  return auction.type !== AuctionType.DUTCH;
}

export function getMinimumBid(auction: Auction): number {
  if (auction.type === AuctionType.DUTCH) {
    return auction.currentPrice;
  }

  return Number((auction.currentPrice + auction.bidIncrement).toFixed(2));
}
