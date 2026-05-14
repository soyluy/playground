export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBidAmount: number | null;
  isWinning: boolean;
  isRetracted: boolean;
  retractedAt: string | null;
  createdAt: string;
}

export interface AutoBid {
  id: string;
  auctionId: string;
  bidderId: string;
  maxAmount: number;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BidHistory {
  data: Bid[];
  total: number;
}
