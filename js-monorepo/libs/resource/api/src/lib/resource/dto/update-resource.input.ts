import { Field, InputType } from '@nestjs/graphql';
import { toOptionalObject, toOptionalStringArray } from '@hub/core';
import { Transform } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { ResourceStatus } from '../enums/resource-status.enum';
import { ResourceType } from '../enums/resource-type.enum';

@InputType()
export class UpdateResourceInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field(() => [String], { nullable: true })
  @Transform(toOptionalStringArray)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @Field(() => ResourceType, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @Field(() => ResourceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  @Transform(toOptionalObject)
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
