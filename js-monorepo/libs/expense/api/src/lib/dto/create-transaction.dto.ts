import { CreateTransactionDto as ICreateTransactionDto } from '@hub/expense-data';
import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransactionDto implements ICreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsIn(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  type!: 'income' | 'expense';

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsDateString()
  date!: string;
}
