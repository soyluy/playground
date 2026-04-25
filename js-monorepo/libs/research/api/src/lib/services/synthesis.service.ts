// synthesis.service.ts
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { SynthesisInput } from '../types/synthesis.types';
import { ResearchableItem } from '@hub/research-data';
const SYSTEM_PROMPT = `
You are a research writer. You will receive verified findings for a single subtopic, each with corroboration status and any contradictions noted.

Your job: write a clear, dense, informative summary based on the findings.

Rules:
- Write in third person, present tense
- Prioritize corroborated findings
- If contradictions exist, briefly note them
- Do not invent information not present in the findings
- Keep the summary concise but complete

Return ONLY a JSON object, no markdown, no explanation:
{"summary": "written summary here", "hasContradictions": true or false}
`;

const synthesisPromptGenerator = (
  item: ResearchableItem,
  input: SynthesisInput,
): string => {
  return `
Topic: ${item.topic}
${item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''}
${item.notes ? `Notes: ${item.notes}` : ''}
${item.instructions ? `Instructions: ${item.instructions}` : ''}

Subtopic: ${input.subtopic.label}
Findings:
${input.findings
  .map(
    (f) => `
  Content: ${f.content}
  Corroborated: ${f.corroborated}
  ${f.contradictions.length ? `Contradictions: ${f.contradictions.join(' | ')}` : ''}
`,
  )
  .join('\n')}
`;
};

@Injectable()
export class SynthesisService {
  private readonly _anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    this._anthropic = new Anthropic({ apiKey, timeout: 600000 });
  }

  async synthesize(
    item: ResearchableItem,
    input: SynthesisInput,
  ): Promise<{
    subtopicLabel: string;
    summary: string;
    hasContradictions: boolean;
    sources: string[];
  }> {
    const prompt = synthesisPromptGenerator(item, input);

    const response = await this._anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text) as {
      summary: string;
      hasContradictions: boolean;
    };

    return {
      subtopicLabel: input.subtopic.label,
      summary: parsed.summary,
      hasContradictions: parsed.hasContradictions,
      sources: input.findings.map((f) => f.sourceUrl),
    };
  }
}
