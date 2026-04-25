import { Injectable } from '@nestjs/common';
import { Source, SourceAnalysisResult } from '../types';
import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@anthropic-ai/sdk/resources';
import { ConfigService } from '@nestjs/config';

const SYSTEM_PROMPT = `
You are a research analyst evaluating a single web source for relevance and quality.

You will be given a source's content alongside the research topic, subtopic, tags, notes, and instructions that define what is being researched.

Your job:
1. Evaluate whether the source contains useful, accurate, and relevant information for the given topic and subtopic.
2. If it does, extract and rewrite only the relevant parts into a clean, dense summary. Remove noise, ads, navigation text, and irrelevant content.
3. If it does not contain useful information, reject it.

Return ONLY one of the following, no explanation, no markdown:
- If useful: a JSON object {"content": "your extracted summary here"}
- If not useful: the exact string "REJECTED"
`;

const analysisPromptGenerator = (source: Source) => `
Topic: ${source.topic}
Subtopic label: ${source.subtopic.label}
Subtopic query: ${source.subtopic.query}
Tags: ${source.tags.join(', ')}
Notes: ${source.notes}
Instructions: ${source.instructions}

Source content:
${source.content}
`;

@Injectable()
export class SourceAnalysisService {
  private readonly anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({
      apiKey,
      timeout: 600000, // 10 minutes
    });
  }

  async analyzeSource(source: Source): Promise<SourceAnalysisResult> {
    const prompt = analysisPromptGenerator(source);
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = this.parseContent(response);
    return content;
  }

  private parseContent(msg: Message): SourceAnalysisResult {
    if (msg.content[0].type !== 'text' || msg.content[0].text === 'REJECTED') {
      return { status: 'rejected' };
    }
    return {
      status: 'accepted',
      content: msg.content[0].text,
    };
  }
}
