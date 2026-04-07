import {
  PaginationDto as IPaginationDto,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from '@hub/todo-data';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto implements IPaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(MIN_PAGE_SIZE)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}
