export type NotificationType =
  | 'BID_PLACED'
  | 'OUTBID'
  | 'AUCTION_WON'
  | 'AUCTION_ENDED'
  | 'AUCTION_STARTING'
  | 'PAYMENT_RECEIVED'
  | 'ITEM_APPROVED'
  | 'ITEM_REJECTED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
