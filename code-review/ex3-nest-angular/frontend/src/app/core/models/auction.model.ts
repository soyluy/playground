export enum AuctionType {
  ENGLISH = 'ENGLISH',
  DUTCH = 'DUTCH',
  RESERVE = 'RESERVE',
  BUY_NOW = 'BUY_NOW',
}

export enum AuctionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDING_SOON = 'ENDING_SOON',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface Auction {
  id: string;
  itemId: string;
  sellerId: string;
  type: AuctionType;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  buyNowPrice: number | null;
  bidIncrement: number;
  extensionMinutes: number;
  extensionThresholdSeconds: number;
  winnerId: string | null;
  finalPrice: number | null;
  viewCount: number;
  watcherCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionSummary {
  id: string;
  title: string;
  type: AuctionType;
  status: AuctionStatus;
  currentPrice: number;
  endTime: string;
  watcherCount: number;
}

export interface AuctionStats {
  auctionId: string;
  watcherCount: number;
  viewCount: number;
  bidCount: number;
  sellerStats: {
    total: number;
    active: number;
    ended: number;
    avgFinalPrice: number;
  };
}
