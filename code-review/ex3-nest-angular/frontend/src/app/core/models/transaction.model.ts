export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BID_HOLD'
  | 'BID_RELEASE'
  | 'PURCHASE'
  | 'REFUND'
  | 'FEE';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string | null;
  status: TransactionStatus;
  createdAt: string;
}
