import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { VerificationResult, ResearchReport } from '../types';
import { ResearchableItem } from '@hub/research-data';

const SYSTEM_PROMPT = `
You are a research writer. You will receive verified findings organized by subtopic, each with corroboration status and any contradictions noted.

Your job: write a clear, dense, informative summary for each subtopic based on its findings. 

Rules:
- Write in third person, present tense
- Prioritize corroborated findings
- If contradictions exist in a subtopic, briefly note them
- Do not invent information not present in the findings
- Keep each section summary concise but complete

Return ONLY a raw JSON array, no markdown, no explanation:
[{
  "subtopicLabel": "exact subtopic label",
  "summary": "written summary here",
  "hasContradictions": true or false
}]
`;

const synthesisPromptGenerator = (
  item: ResearchableItem,
  results: VerificationResult[],
): string => {
  const sections = results
    .map(
      ({ subtopic, findings }) => `
Subtopic: ${subtopic.label}
Findings:
${findings
  .map(
    (f) => `
  Content: ${f.content}
  Corroborated: ${f.corroborated}
  ${f.contradictions.length ? `Contradictions: ${f.contradictions.join(' | ')}` : ''}
`,
  )
  .join('\n')}
`,
    )
    .join('\n---\n');

  return `
Topic: ${item.topic}
${item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''}
${item.notes ? `Notes: ${item.notes}` : ''}
${item.instructions ? `Instructions: ${item.instructions}` : ''}

Findings by subtopic:
${sections}
`;
};

@Injectable()
export class SynthesisService {
  private readonly _anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    this._anthropic = new Anthropic({
      apiKey: this._configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async synthesize(
    item: ResearchableItem,
    results: VerificationResult[],
  ): Promise<ResearchReport> {
    const prompt = synthesisPromptGenerator(item, results);

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
      summary: string;
      hasContradictions: boolean;
    }[];

    const sourceMap = new Map(
      results.map((r) => [
        r.subtopic.label,
        r.findings.map((f) => f.sourceUrl),
      ]),
    );

    return {
      title: item.topic,
      sections: parsed.map(({ subtopicLabel, summary, hasContradictions }) => ({
        subtopicLabel,
        summary,
        hasContradictions,
        sources: sourceMap.get(subtopicLabel) ?? [],
      })),
    };
  }
}
