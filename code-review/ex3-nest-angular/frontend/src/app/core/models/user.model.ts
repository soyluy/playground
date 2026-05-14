export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
