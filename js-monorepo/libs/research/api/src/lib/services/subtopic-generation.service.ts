import { Inject, Injectable } from '@nestjs/common';
import { ResearchableItem } from '@hub/research-data';
import { Subtopic, SubtopicGenerationResult } from '../types';
import { LLM, LLMProvider } from '@hub/llm-api';
import { MalformedResponseException } from '../exceptions/malformed-response.exception';

const SYSTEM_PROMPT = `
You are a research planning assistant. Given a topic and optional metadata (tags, notes, instructions), generate a set of 5-8 subtopics that together provide complete coverage of the topic for research or preparation purposes.
Return ONLY a raw JSON array with no markdown, no explanation, no code fences. Each item must follow this exact shape, no prettier formatting, no extra whitespace:
[{ "label": "example label", "query": "example search query" }]
label is the subtopic name. query is a concise, high-quality search engine query designed to surface the most relevant content for that subtopic.
`;

const userPromptGenerator = (
  item: Omit<ResearchableItem, 'id' | 'status' | 'dueDate'>,
) => `
Topic: ${item.topic}
Tags: ${item.tags.join(', ')}
Notes: ${item.notes}
Instructions: ${item.instructions}
`;

@Injectable()
export class SubtopicGenerationService {
  constructor(@Inject(LLM) private readonly _llm: LLMProvider) {}

  public async generateSubtopics(
    item: Omit<ResearchableItem, 'id' | 'status' | 'dueDate'>,
  ): Promise<SubtopicGenerationResult> {
    const response = await this._llm.generate({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPromptGenerator(item) }],
      maxTokens: 1000,
    });
    const subtopics = this.parseSubtopics(response);
    return {
      subtopics,
    };
  }

  private parseSubtopics(response: string): Subtopic[] {
    if (response.trim() === 'REJECTED') return [];
    try {
      const parsed = JSON.parse(response);
      return parsed as Subtopic[];
    } catch {
      throw new MalformedResponseException(response, 'JSON array of subtopics');
    }
  }
}
