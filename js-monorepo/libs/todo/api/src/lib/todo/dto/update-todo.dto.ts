import { UpdateTodoDto as IUpdateTodoDto } from '@hub/todo-data';
import {
  IsArray,
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
  title: string | null = null;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsBoolean()
  @IsOptional()
  completed: boolean | null = null;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds: number[] | null = null;
}
