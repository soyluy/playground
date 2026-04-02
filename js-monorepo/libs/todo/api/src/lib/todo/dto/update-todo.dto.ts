import { UpdateTodoDto as IUpdateTodoDto } from '@hub/todo-data';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
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
  title: string | null = null;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  dueDate!: Date | null;

  @IsBoolean()
  @IsOptional()
  completed: boolean | null = null;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds: number[] | null = null;
}
