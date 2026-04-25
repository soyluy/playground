import { Subtopic } from './subtopic.types';

export type VerificationFinding = {
  sourceUrl: string;
  corroborated: boolean;
  contradictions: string[];
};

export type VerificationResult = {
  subtopic: Subtopic;
  findings: VerificationFinding[];
};
