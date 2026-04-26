import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import { LLM, LLMRequest } from '../../interfaces/llm.interface';
import { UnexpectedContentTypeException } from './unexpected-content-type.exception';

@Injectable()
export class AnthropicProvider implements LLM {
  private readonly _anthropic: Anthropic;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    const timeout =
      this._configService.get<number>('ANTHROPIC_TIMEOUT') ?? 30000; // Default to 30 seconds

    this._anthropic = new Anthropic({
      apiKey,
      timeout,
    });
  }

  async generate(request: LLMRequest): Promise<string> {
    const response = await this._anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: request.maxTokens,
      system: request.system,
      messages: request.messages,
    });
    if (response.content[0].type !== 'text') {
      throw new UnexpectedContentTypeException(response);
    }
    return response.content[0].text;
  }
}
