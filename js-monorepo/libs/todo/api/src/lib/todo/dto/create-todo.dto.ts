import { CreateTodoDto as ICreateTodoDto } from '@hub/todo-data';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTodoDto implements ICreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsBoolean()
  @IsNotEmpty()
  completed!: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds: number[] = [];
}
