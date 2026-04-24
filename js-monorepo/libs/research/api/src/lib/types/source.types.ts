import { Subtopic } from './subtopic.types';

export type Source = {
  content: string;
  topic: string;
  subtopic: Subtopic;
  tags: string[];
  notes: string;
  instructions: string;
};

export type SourceAnalysisResult =
  | { status: 'accepted'; content: string }
  | { status: 'rejected' };
