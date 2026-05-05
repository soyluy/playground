import { Inject, Injectable } from '@nestjs/common';
import { Subtopic, VerificationFinding, VerificationResult } from '../../types';
import { LLM, LLMProvider } from '@hub/llm-api';
import { MalformedResponseException } from '../../exceptions/malformed-response.exception';

type SubtopicFindings = {
  subtopic: Subtopic;
  findings: { content: string; sourceUrl: string }[];
};

const SYSTEM_PROMPT = `
You are a research verification analyst. You will receive findings on a specific subtopic from multiple sources.

Your job:
1. Cross-reference the findings against each other to identify contradictions and corroborations.
2. For each finding, determine if it is corroborated (supported by at least one other finding) or contradicted by others.

Return ONLY a raw JSON array, no markdown, no explanation:
[{
  "sourceUrl": "exact original url",
  "corroborated": true or false,
  "contradictions": ["content of contradicting finding if any"]
}]
`;

const verificationPromptGenerator = (
  subtopicFinding: SubtopicFindings,
): string => {
  const prompt = `
	Subtopic: ${subtopicFinding.subtopic.label}
	Findings:
	${subtopicFinding.findings.map((f, i) => `  [${i + 1}] (source: ${f.sourceUrl})\n  ${f.content}`).join('\n')}
	`;
  return prompt;
};

@Injectable()
export class VerificationService {
  constructor(@Inject(LLM) private readonly _llm: LLMProvider) {}

  async verify(subtopicFinding: SubtopicFindings): Promise<VerificationResult> {
    const prompt = verificationPromptGenerator(subtopicFinding);

    const response = await this._llm.generate({
      maxTokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const findings = this.parseResponse(response);

    return {
      subtopic: subtopicFinding.subtopic,
      findings: findings,
    };
  }

  private parseResponse(response: string): VerificationFinding[] {
    try {
      const parsed = JSON.parse(response) as VerificationFinding[];
      return parsed;
    } catch {
      throw new MalformedResponseException(
        response,
        'JSON array of verification findings',
      );
    }
  }
}
