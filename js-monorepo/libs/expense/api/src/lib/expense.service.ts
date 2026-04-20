import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@hub/prisma';
import {
  CreateTransactionDto,
  DeleteTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from '@hub/expense-data';
import { User } from '@hub/user-api';
import { Prisma } from '@hub/prisma';

@Injectable()
export class ExpenseService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  async getExpenses(user: User): Promise<Transaction[]> {
    return this._prismaService.expense.findMany({
      where: {
        ownerId: user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getExpense(user: User, id: number): Promise<Transaction | null> {
    return this._prismaService.expense.findUnique({
      where: { id, ownerId: user.id },
    });
  }

  async createExpense(
    user: User,
    createExpenseDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this._prismaService.expense.create({
      data: {
        ...createExpenseDto,
        ownerId: user.id,
      },
    });
  }

  async updateExpense(
    user: User,
    id: number,
    updateExpenseDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const data: Prisma.ExpenseUpdateInput = {
      description: updateExpenseDto.description ?? undefined,
      amount: updateExpenseDto.amount ?? undefined,
      type: updateExpenseDto.type ?? undefined,
      category: updateExpenseDto.category ?? undefined,
      date: updateExpenseDto.date ?? undefined,
    };
    return this._prismaService.expense.update({
      where: { id, ownerId: user.id },
      data,
    });
  }

  async deleteExpense(
    user: User,
    deleteExpenseDto: DeleteTransactionDto,
  ): Promise<Transaction> {
    return this._prismaService.expense.delete({
      where: { id: deleteExpenseDto.id, ownerId: user.id },
    });
  }
}
