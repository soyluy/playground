import { UpdateTodoDto as IUpdateTodoDto } from '@hub/todo-data';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTodoDto implements IUpdateTodoDto {
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
