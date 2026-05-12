import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResearchDocument = HydratedDocument<Research>;

export class ResearchSubtopic {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  explanation!: string;
}

export class ResearchResult {
  @Prop({ required: true })
  summary!: string;

  @Prop({ type: [ResearchSubtopic], default: [] })
  subtopics!: ResearchSubtopic[];
}

@Schema({ timestamps: true })
export class Research {
  @Prop({ required: true })
  todoId!: string;

  @Prop({ required: true, trim: true })
  topic!: string;

  @Prop({
    type: String,
    enum: ['pending', 'running', 'done', 'error'],
    required: true,
    default: 'running',
  })
  status!: 'pending' | 'running' | 'done' | 'error';

  @Prop({ type: ResearchResult, default: null })
  result!: ResearchResult | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);
