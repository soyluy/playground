import { Anthropic } from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subtopic, VerificationFinding, VerificationResult } from '../types';

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
  private readonly _anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    this._anthropic = new Anthropic({
      apiKey,
      timeout: 600000, // 10 minutes
    });
  }

  async verify(subtopicFinding: SubtopicFindings): Promise<VerificationResult> {
    const prompt = verificationPromptGenerator(subtopicFinding);

    const response = await this._anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '[]';

    const findings = JSON.parse(text) as VerificationFinding[];

    return {
      subtopic: subtopicFinding.subtopic,
      findings: findings,
    };
  }
}
