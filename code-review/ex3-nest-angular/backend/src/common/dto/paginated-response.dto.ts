export class PaginatedResponseDto<T> {
  data!: T[];
  total!: number;
  limit!: number;
  offset!: number;
}
