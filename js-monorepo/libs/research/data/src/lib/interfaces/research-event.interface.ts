import { ResearchResult } from './research-result.interface';
import { ResearchableItem } from './researchable-item.interface';

export type ResearchEvent =
  | { type: 'start'; item: ResearchableItem }
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
