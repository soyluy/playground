import { UpdateTransactionDto as IUpdateTransactionDto } from '@hub/expense-data';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTransactionDto implements IUpdateTransactionDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsIn(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  @IsOptional()
  type?: 'income' | 'expense';

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
