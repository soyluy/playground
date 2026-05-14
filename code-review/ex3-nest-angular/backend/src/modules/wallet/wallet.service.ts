import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _transactionRepository: TransactionRepository,
  ) {}

  async getBalance(userId: string): Promise<number> {
    return this._transactionRepository.getUserBalance(userId);
  }

  async holdFunds(userId: string, amount: number, reference: string): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.getUserOrFail(userId);
    const balance = await this.getBalance(userId);
    const held = await this._transactionRepository.sumHeldAmounts(userId);
    const available = balance - held;
    if (available < amount) {
      throw new BadRequestException('Insufficient available funds');
    }

    await this._transactionRepository.save(
      this._transactionRepository.create({
        user,
        type: TransactionType.BID_HOLD,
        amount,
        balanceBefore: balance,
        balanceAfter: balance,
        reference,
        description: 'Bid hold',
        status: TransactionStatus.PENDING,
      }),
    );
  }

  async releaseFunds(userId: string, amount: number, reference: string): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.getUserOrFail(userId);
    const balance = await this.getBalance(userId);
    await this._transactionRepository.save(
      this._transactionRepository.create({
        user,
        type: TransactionType.BID_RELEASE,
        amount,
        balanceBefore: balance,
        balanceAfter: balance,
        reference,
        description: 'Bid hold release',
        status: TransactionStatus.COMPLETED,
      }),
    );
  }

  async transferFunds(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reference: string,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to same account');
    }

    const sender = await this.getUserOrFail(fromUserId);
    const receiver = await this.getUserOrFail(toUserId);

    const senderBalance = await this.getBalance(fromUserId);
    if (senderBalance < amount) {
      throw new BadRequestException('Insufficient sender funds');
    }
    const receiverBalance = await this.getBalance(toUserId);

    await this._transactionRepository.save(
      this._transactionRepository.create({
        user: sender,
        type: TransactionType.WITHDRAWAL,
        amount,
        balanceBefore: senderBalance,
        balanceAfter: senderBalance - amount,
        reference: `${reference}:out`,
        description: `Transfer to ${toUserId}`,
        status: TransactionStatus.COMPLETED,
      }),
    );
    await this._userRepository.updateBalance(sender.id, senderBalance - amount);

    await this._transactionRepository.save(
      this._transactionRepository.create({
        user: receiver,
        type: TransactionType.DEPOSIT,
        amount,
        balanceBefore: receiverBalance,
        balanceAfter: receiverBalance + amount,
        reference: `${reference}:in`,
        description: `Transfer from ${fromUserId}`,
        status: TransactionStatus.COMPLETED,
      }),
    );
    await this._userRepository.updateBalance(receiver.id, receiverBalance + amount);
  }

  async processPayment(
    buyerId: string,
    sellerId: string,
    amount: number,
    reference: string,
    feeAmount: number = 0,
  ): Promise<void> {
    if (feeAmount < 0) {
      throw new BadRequestException('Fee amount cannot be negative');
    }

    const totalDebit = amount + feeAmount;
    await this.transferFunds(buyerId, sellerId, amount, `${reference}:payment`);

    if (feeAmount > 0) {
      const buyer = await this.getUserOrFail(buyerId);
      const balance = await this.getBalance(buyerId);
      await this._transactionRepository.save(
        this._transactionRepository.create({
          user: buyer,
          type: TransactionType.FEE,
          amount: feeAmount,
          balanceBefore: balance,
          balanceAfter: balance - feeAmount,
          reference: `${reference}:fee`,
          description: 'Marketplace fee',
          status: TransactionStatus.COMPLETED,
        }),
      );
      await this._userRepository.updateBalance(buyerId, balance - feeAmount);
    }

    if (totalDebit <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }
  }

  async processRefund(
    userId: string,
    amount: number,
    reference: string,
    description: string = 'Refund issued',
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.getUserOrFail(userId);
    const balance = await this.getBalance(userId);
    const nextBalance = balance + amount;

    await this._transactionRepository.save(
      this._transactionRepository.create({
        user,
        type: TransactionType.REFUND,
        amount,
        balanceBefore: balance,
        balanceAfter: nextBalance,
        reference,
        description,
        status: TransactionStatus.COMPLETED,
      }),
    );
    await this._userRepository.updateBalance(user.id, nextBalance);
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: unknown[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    return this._transactionRepository.getTransactionHistory(
      userId,
      {},
      { page: safePage, limit: safeLimit },
    );
  }

  private async getUserOrFail(userId: string): Promise<User> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
