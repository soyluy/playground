export enum AuctionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDING_SOON = 'ENDING_SOON',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export const AUCTION_STATUS_TRANSITIONS: Record<AuctionStatus, AuctionStatus[]> = {
  [AuctionStatus.DRAFT]: [
    AuctionStatus.SCHEDULED,
    AuctionStatus.CANCELLED,
    AuctionStatus.FAILED,
  ],
  [AuctionStatus.SCHEDULED]: [
    AuctionStatus.ACTIVE,
    AuctionStatus.CANCELLED,
    AuctionStatus.FAILED,
  ],
  [AuctionStatus.ACTIVE]: [
    AuctionStatus.ENDING_SOON,
    AuctionStatus.ENDED,
    AuctionStatus.CANCELLED,
    AuctionStatus.FAILED,
  ],
  [AuctionStatus.ENDING_SOON]: [
    AuctionStatus.ACTIVE,
    AuctionStatus.ENDED,
    AuctionStatus.CANCELLED,
    AuctionStatus.FAILED,
  ],
  [AuctionStatus.ENDED]: [],
  [AuctionStatus.CANCELLED]: [],
  [AuctionStatus.FAILED]: [],
};

export const isTransitionAllowed = (
  from: AuctionStatus,
  to: AuctionStatus,
): boolean => AUCTION_STATUS_TRANSITIONS[from].includes(to);
