import { Injectable } from '@nestjs/common';
import { ResearchableItem } from '@hub/research-data';
import { Subtopic, SubtopicGenerationResult } from '../types';
import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@anthropic-ai/sdk/resources';

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
  private readonly anthropic = new Anthropic();

  public async generateSubtopics(
    item: Omit<ResearchableItem, 'id' | 'status' | 'dueDate'>,
  ): Promise<SubtopicGenerationResult> {
    // TODO: Implement subtopic generation
    const msg = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPromptGenerator(item),
        },
      ],
    });
    const subtopics = this.parseSubtopics(msg);
    return {
      subtopics,
    };
  }

  private parseSubtopics(msg: Message): Subtopic[] {
    const subtopics = JSON.parse(
      // TODO: Handle errors
      msg.content[0].type === 'text' ? msg.content[0].text : '[]',
    ) as Subtopic[];

    return subtopics;
  }
}
