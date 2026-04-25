import { Subtopic } from './subtopic.types';

export type SynthesisInput = {
  subtopic: Subtopic;
  findings: {
    content: string;
    sourceUrl: string;
    corroborated: boolean;
    contradictions: string[];
  }[];
};

export type ReportSection = {
  subtopicLabel: string;
  summary: string;
  sources: string[];
  hasContradictions: boolean;
};

export type ResearchReport = {
  title: string;
  sections: ReportSection[];
};
