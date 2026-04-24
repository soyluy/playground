import { Subtopic } from './subtopic.types';

export type VerifiedFinding = {
  content: string;
  sourceUrl: string;
  corroborated: boolean;
  contradictions: string[]; // content of conflicting findings
};

export type VerificationResult = {
  subtopic: Subtopic;
  findings: VerifiedFinding[];
};
