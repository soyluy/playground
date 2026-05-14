import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Auction } from '../../domain/entities/auction.entity';
import { Bid } from '../../domain/entities/bid.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { User } from '../../domain/entities/user.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { AuctionRepository } from '../../infrastructure/repositories/auction.repository';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

type PaginationInput = {
  limit?: number;
  offset?: number;
};

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _auctionRepository: AuctionRepository,
    private readonly _bidRepository: BidRepository,
    private readonly _transactionRepository: TransactionRepository,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    payload: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>,
  ): Promise<User> {
    const user = await this.getProfile(userId);
    if (payload.firstName !== undefined) {
      user.firstName = payload.firstName.trim();
    }
    if (payload.lastName !== undefined) {
      user.lastName = payload.lastName.trim();
    }
    if (payload.phone !== undefined) {
      user.phone = payload.phone;
    }

    return this._userRepository.save(user);
  }

  async getBalance(userId: string): Promise<number> {
    return this._transactionRepository.getUserBalance(userId);
  }

  async depositBalance(
    userId: string,
    amount: number,
    reference: string,
    description?: string,
  ): Promise<number> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.getProfile(userId);
    const balanceBefore = await this.getBalance(userId);
    const balanceAfter = balanceBefore + amount;

    const transaction = this._transactionRepository.create({
      user,
      type: TransactionType.DEPOSIT,
      amount,
      balanceBefore,
      balanceAfter,
      reference,
      description: description ?? null,
      status: TransactionStatus.COMPLETED,
    });

    await this._transactionRepository.save(transaction);
    await this._userRepository.updateBalance(userId, balanceAfter);
    return balanceAfter;
  }

  async withdrawBalance(
    userId: string,
    amount: number,
    reference: string,
    description?: string,
  ): Promise<number> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.getProfile(userId);
    const balanceBefore = await this.getBalance(userId);
    if (balanceBefore < amount) {
      throw new NotFoundException('Insufficient balance');
    }

    const balanceAfter = balanceBefore - amount;
    const transaction = this._transactionRepository.create({
      user,
      type: TransactionType.WITHDRAWAL,
      amount,
      balanceBefore,
      balanceAfter,
      reference,
      description: description ?? null,
      status: TransactionStatus.COMPLETED,
    });

    await this._transactionRepository.save(transaction);
    await this._userRepository.updateBalance(userId, balanceAfter);
    return balanceAfter;
  }

  async getUserAuctions(
    userId: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: Auction[]; total: number }> {
    const all = await this._auctionRepository.findBySeller(userId);
    return this.paginate(all, pagination);
  }

  async getUserBids(
    userId: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: Bid[]; total: number }> {
    const limit = pagination.limit ?? 20;
    const rows = await this._bidRepository.findByBidder(userId, Math.max(limit * 5, 100));
    return this.paginate(rows, pagination);
  }

  async getUserTransactions(
    userId: string,
    pagination: PaginationInput = {},
  ): Promise<{ data: Transaction[]; total: number }> {
    const limit = pagination.limit ?? 20;
    const rows = await this._transactionRepository.findByUser(
      userId,
      Math.max(limit * 5, 100),
    );
    return this.paginate(rows, pagination);
  }

  async banUser(userId: string): Promise<User> {
    const user = await this.getProfile(userId);
    user.isBanned = true;
    return this._userRepository.save(user);
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.getProfile(userId);
    user.isBanned = false;
    return this._userRepository.save(user);
  }

  async verifyUser(userId: string): Promise<User> {
    const user = await this.getProfile(userId);
    user.isVerified = true;
    return this._userRepository.save(user);
  }

  private paginate<T>(
    rows: T[],
    pagination: PaginationInput,
  ): { data: T[]; total: number } {
    const limit = Math.max(1, Math.min(100, pagination.limit ?? 20));
    const offset = Math.max(0, pagination.offset ?? 0);
    const data = rows.slice(offset, offset + limit);
    return { data, total: rows.length };
  }
}
