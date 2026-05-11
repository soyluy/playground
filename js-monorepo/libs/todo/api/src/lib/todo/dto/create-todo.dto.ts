import { CreateTodoDto as ICreateTodoDto } from '@hub/todo-data';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTodoDto implements ICreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  dueDate!: Date | null;

  @IsBoolean()
  @IsNotEmpty()
  completed!: boolean;

  @IsBoolean()
  @IsOptional()
  research = false;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds: number[] = [];
}
