import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { ResourceStatus } from '../resource/enums/resource-status.enum';
import { ResourceType } from '../resource/enums/resource-type.enum';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({
  timestamps: true,
})
export class Resource {
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    trim: true,
  })
  url?: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags!: string[];

  @Prop({
    required: true,
    trim: true,
  })
  category!: string;

  @Prop({
    type: String,
    enum: ResourceType,
    required: true,
  })
  type!: ResourceType;

  @Prop({
    type: String,
    enum: ResourceStatus,
    required: true,
    default: ResourceStatus.WANT_TO_CONSUME,
  })
  status!: ResourceStatus;

  @Prop({
    type: SchemaTypes.Mixed,
    default: {},
  })
  metadata!: Record<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
