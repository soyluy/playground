import { Anthropic } from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subtopic, VerificationResult, VerifiedFinding } from '../types';

type SubtopicFindings = {
  subtopic: Subtopic;
  findings: { content: string; sourceUrl: string }[];
};

const SYSTEM_PROMPT = `
You are a research verification analyst. You will receive findings organized by subtopic from multiple sources.

Your job:
1. Cross-reference findings across all subtopics to identify contradictions and corroborations.
2. For each finding, determine if it is corroborated (supported by at least one other finding) or contradicted by others.

Return ONLY a raw JSON array, no markdown, no explanation:
[{
  "subtopicLabel": "exact subtopic label",
  "findings": [{
    "content": "exact original content unchanged",
    "sourceUrl": "exact original url",
    "corroborated": true or false,
    "contradictions": ["content of contradicting finding if any"]
  }]
}]
`;

const verificationPromptGenerator = (
  subtopicFindings: SubtopicFindings[],
): string => {
  return subtopicFindings
    .map(
      ({ subtopic, findings }) => `
Subtopic: ${subtopic.label}
Findings:
${findings.map((f, i) => `  [${i + 1}] (source: ${f.sourceUrl})\n  ${f.content}`).join('\n')}
`,
    )
    .join('\n---\n');
};

@Injectable()
export class VerificationService {
  private readonly _anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    this._anthropic = new Anthropic({
      apiKey: this._configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async verify(
    subtopicFindings: SubtopicFindings[],
  ): Promise<VerificationResult[]> {
    const prompt = verificationPromptGenerator(subtopicFindings);

    const response = await this._anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '[]';

    const parsed = JSON.parse(text) as {
      subtopicLabel: string;
      findings: VerifiedFinding[];
    }[];

    const subtopicMap = new Map(
      subtopicFindings.map((s) => [s.subtopic.label, s.subtopic]),
    );

    return parsed.map(({ subtopicLabel, findings }) => ({
      subtopic: subtopicMap.get(subtopicLabel) ?? {
        label: subtopicLabel,
        query: '',
      },
      findings,
    }));
  }
}
