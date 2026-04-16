import { ArgsType, Field } from '@nestjs/graphql';
import { toOptionalStringArray } from '@hub/core';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { ResourceStatus } from '../enums/resource-status.enum';
import { ResourceType } from '../enums/resource-type.enum';

@ArgsType()
export class GetResourcesArgs extends PaginationDto {
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
