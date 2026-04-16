import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GraphQLJSON } from 'graphql-scalars';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { ResourceStatus } from '../resource/enums/resource-status.enum';
import { ResourceType } from '../resource/enums/resource-type.enum';

export type ResourceDocument = HydratedDocument<Resource>;

@ObjectType()
@Schema({
  timestamps: true,
})
export class Resource {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Field(() => String, { nullable: true })
  @Prop({
    trim: true,
  })
  url?: string;

  @Field(() => String, { nullable: true })
  @Prop({
    trim: true,
  })
  description?: string;

  @Field(() => [String])
  @Prop({
    type: [String],
    default: [],
  })
  tags!: string[];

  @Field(() => String)
  @Prop({
    required: true,
    trim: true,
  })
  category!: string;

  @Field(() => ResourceType)
  @Prop({
    type: String,
    enum: ResourceType,
    required: true,
  })
  type!: ResourceType;

  @Field(() => ResourceStatus)
  @Prop({
    type: String,
    enum: ResourceStatus,
    required: true,
    default: ResourceStatus.WANT_TO_CONSUME,
  })
  status!: ResourceStatus;

  @Field(() => GraphQLJSON)
  @Prop({
    type: SchemaTypes.Mixed,
    default: {},
  })
  metadata!: Record<string, unknown>;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
