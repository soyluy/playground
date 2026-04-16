import { Field, Int } from '@nestjs/graphql';
import { toNumber } from '@hub/core';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export const DEFAULT_RESOURCE_LIMIT = 20;
export const MAX_RESOURCE_LIMIT = 100;
export const DEFAULT_RESOURCE_OFFSET = 0;

export class PaginationDto {
  @Field(() => Int, { defaultValue: DEFAULT_RESOURCE_LIMIT })
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  @Max(MAX_RESOURCE_LIMIT)
  limit: number = DEFAULT_RESOURCE_LIMIT;

  @Field(() => Int, { defaultValue: DEFAULT_RESOURCE_OFFSET })
  @Transform(toNumber)
  @IsInt()
  @Min(0)
  offset: number = DEFAULT_RESOURCE_OFFSET;
}
