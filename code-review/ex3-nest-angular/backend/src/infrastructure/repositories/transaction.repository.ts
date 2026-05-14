import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

type DateRangeInput = {
  from?: Date;
  to?: Date;
};

type PaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {
    super(Transaction, _dataSource.createEntityManager());
  }

  async findByUser(userId: string, limit: number = 100): Promise<Transaction[]> {
    return this.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByReference(reference: string): Promise<Transaction[]> {
    return this.find({
      where: { reference },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserBalance(userId: string): Promise<number> {
    const raw = await this.createQueryBuilder('tx')
      .select(
        `COALESCE(SUM(
          CASE
            WHEN tx.type IN (:...credits) THEN tx.amount
            WHEN tx.type IN (:...debits) THEN -tx.amount
            ELSE 0
          END
        ), 0)`,
        'balance',
      )
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.status = :status', { status: TransactionStatus.COMPLETED })
      .setParameters({
        credits: [TransactionType.DEPOSIT, TransactionType.REFUND, TransactionType.BID_HOLD],
        debits: [
          TransactionType.WITHDRAWAL,
          TransactionType.PURCHASE,
          TransactionType.FEE,
          TransactionType.BID_RELEASE,
        ],
      })
      .getRawOne<{ balance: string }>();

    return Number(raw?.balance ?? 0);
  }

  async getPendingTransactions(limit: number = 200): Promise<Transaction[]> {
    return this.find({
      where: { status: TransactionStatus.PENDING },
      relations: { user: true },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async getTransactionHistory(
    userId: string,
    dateRange: DateRangeInput,
    pagination: PaginationInput,
  ): Promise<{ data: Transaction[]; total: number }> {
    const page = pagination.page < 1 ? 1 : pagination.page;
    const limit = pagination.limit > 200 ? 200 : pagination.limit;

    const qb = this.createQueryBuilder('tx').where('tx.user_id = :userId', { userId });

    if (dateRange.from) {
      qb.andWhere('tx.created_at >= :from', { from: dateRange.from });
    }

    if (dateRange.to) {
      qb.andWhere('tx.created_at <= :to', { to: dateRange.to });
    }

    qb.orderBy('tx.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async sumHeldAmounts(userId: string): Promise<number> {
    const raw = await this.createQueryBuilder('tx')
      .select(
        `COALESCE(SUM(
          CASE
            WHEN tx.type = :holdType THEN tx.amount
            WHEN tx.type = :releaseType THEN -tx.amount
            ELSE 0
          END
        ), 0)`,
        'heldAmount',
      )
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.status IN (:...statuses)', {
        statuses: [TransactionStatus.PENDING, TransactionStatus.COMPLETED],
      })
      .setParameters({
        holdType: TransactionType.BID_HOLD,
        releaseType: TransactionType.BID_RELEASE,
      })
      .getRawOne<{ heldAmount: string }>();

    return Number(raw?.heldAmount ?? 0);
  }
}
