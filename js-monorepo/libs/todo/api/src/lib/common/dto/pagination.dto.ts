import { PaginationDto as IPaginationDto } from '@hub/todo-data';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto implements IPaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
