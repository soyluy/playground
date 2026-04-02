import { GetTodoQueryParamsDto as IGetTodoQueryParamsDto } from '@hub/todo-data';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { parseArrayQueryParam } from '../../common/util/array-query-param-parser';

export class GetTodoQueryParamsDto
  extends PaginationDto
  implements IGetTodoQueryParamsDto
{
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @Transform(({ value }) => parseArrayQueryParam<number>(value, Number))
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];

  @Transform(({ value }) => parseArrayQueryParam<number>(value, Number))
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allIncludeTags?: number[];

  @Transform(({ value }) => parseArrayQueryParam<number>(value, Number))
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allExcludeTags?: number[];

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['title', 'dueDate', 'createdAt', 'updatedAt'], {
    message: 'Sort by must be either title, dueDate, createdAt, or updatedAt',
  })
  sortBy?: 'title' | 'dueDate' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Sort order must be either asc or desc' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsDate()
  dueDateBefore?: Date;

  @IsOptional()
  @IsDate()
  dueDateAfter?: Date;
}
