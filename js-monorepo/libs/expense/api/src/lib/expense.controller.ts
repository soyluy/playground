import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import {
  CreateTransactionResponse,
  DeleteTransactionResponse,
  Transaction,
  UpdateTransactionResponse,
} from '@hub/expense-data';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '@hub/user-api';
import { CurrentUser } from '@hub/auth';

@Controller('expense')
export class ExpenseController {
  @Inject(ExpenseService)
  private readonly _expenseService!: ExpenseService;

  @Get()
  getExpenses(@CurrentUser() user: User): Promise<Transaction[]> {
    return this._expenseService.getExpenses(user);
  }

  @Get(':id')
  getExpense(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<Transaction | null> {
    return this._expenseService.getExpense(user, id);
  }

  @Post()
  createExpense(
    @Body() createExpenseDto: CreateTransactionDto,
    @CurrentUser() user: User,
  ): Promise<CreateTransactionResponse> {
    return this._expenseService.createExpense(user, createExpenseDto);
  }

  @Patch(':id')
  updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateTransactionDto,
    @CurrentUser() user: User,
  ): Promise<UpdateTransactionResponse> {
    return this._expenseService.updateExpense(user, id, updateExpenseDto);
  }

  @Delete(':id')
  deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<DeleteTransactionResponse> {
    return this._expenseService.deleteExpense(user, { id });
  }
}
