import { AuctionStatus } from '../models/auction.model';

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTimeRemaining(endTime: string | Date): string {
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const diffMs = end.getTime() - Date.now();
  if (diffMs <= 0) {
    return 'Ended';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

export function formatBidCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k bids`;
  }

  if (count === 1) {
    return '1 bid';
  }

  return `${count} bids`;
}

export function formatAuctionStatus(status: AuctionStatus): string {
  switch (status) {
    case AuctionStatus.DRAFT:
      return 'Draft';
    case AuctionStatus.SCHEDULED:
      return 'Scheduled';
    case AuctionStatus.ACTIVE:
      return 'Active';
    case AuctionStatus.ENDING_SOON:
      return 'Ending Soon';
    case AuctionStatus.ENDED:
      return 'Ended';
    case AuctionStatus.CANCELLED:
      return 'Cancelled';
    case AuctionStatus.FAILED:
      return 'Failed';
    default:
      return status;
  }
}
