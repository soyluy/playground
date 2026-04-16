import { Field, InputType } from '@nestjs/graphql';
import { toObjectOrDefault, toStringArray } from '@hub/core';
import { Transform } from 'class-transformer';
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
export class CreateResourceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field(() => [String], { defaultValue: [] })
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @Field()
  @IsString()
  @IsNotEmpty()
  category!: string;

  @Field(() => ResourceType)
  @IsEnum(ResourceType)
  type!: ResourceType;

  @Field(() => ResourceStatus, {
    nullable: true,
    defaultValue: ResourceStatus.WANT_TO_CONSUME,
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @Field(() => String, { nullable: true, defaultValue: '{}' })
  @Transform(toObjectOrDefault)
  @IsOptional()
  @IsObject()
  metadata: Record<string, unknown> = {};
}
