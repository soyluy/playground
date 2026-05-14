export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  condition: ItemCondition;
  images: string[];
  startingPrice: number;
  reservePrice: number | null;
  buyNowPrice: number | null;
  status: ItemStatus;
  sellerId: string;
  categoryId: string;
  weight: number | null;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ItemStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
}
