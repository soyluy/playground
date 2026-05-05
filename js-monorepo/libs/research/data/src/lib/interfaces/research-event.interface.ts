import { ResearchResult } from './research-result.interface';

export type ResearchEvent =
  | {
      type: 'progress';
      step:
        | 'subtopics'
        | 'web_search'
        | 'source_analysis'
        | 'verification'
        | 'synthesis';
      status: 'running' | 'done';
    }
  | { type: 'result'; data: ResearchResult }
  | { type: 'error'; error: string }
  | { type: 'complete' };
