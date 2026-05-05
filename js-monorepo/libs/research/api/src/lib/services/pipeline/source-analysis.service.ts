import { Inject, Injectable } from '@nestjs/common';
import { Source, SourceAnalysisResult } from '../../types';
import { LLM, LLMProvider, LLMRequest } from '@hub/llm-api';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MalformedResponseException } from '../../exceptions/malformed-response.exception';

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
  constructor(
    @Inject(LLM) private readonly _llm: LLMProvider,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: Logger,
  ) {}

  async analyzeSource(source: Source): Promise<SourceAnalysisResult> {
    const prompt = analysisPromptGenerator(source);
    const request: LLMRequest = {
      maxTokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    };
    try {
      const response = await this._llm.generate(request);
      return this.formatResponse(response);
    } catch (error) {
      this._logger.error('source_analysis_error', { error });
      return { status: 'rejected' };
    }
  }

  private formatResponse(response: string): SourceAnalysisResult {
    if (response.trim() === 'REJECTED') return { status: 'rejected' };
    try {
      const parsed = JSON.parse(response);
      return { status: 'accepted', content: parsed.content };
    } catch {
      throw new MalformedResponseException(response, 'JSON object');
    }
  }
}
