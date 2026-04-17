import { ArgsType, Field, Int } from '@nestjs/graphql';
import { toNumber, toOptionalStringArray } from '@hub/core';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  DEFAULT_RESOURCE_LIMIT,
  DEFAULT_RESOURCE_OFFSET,
  MAX_RESOURCE_LIMIT,
} from '../../common/dto/pagination.constants';
import { ResourceStatus } from '../enums/resource-status.enum';
import { ResourceType } from '../enums/resource-type.enum';

@ArgsType()
export class GetResourcesArgs {
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

  @Field(() => ResourceType, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @Field(() => ResourceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @Field(() => [String], { nullable: true })
  @Transform(toOptionalStringArray)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;
}
