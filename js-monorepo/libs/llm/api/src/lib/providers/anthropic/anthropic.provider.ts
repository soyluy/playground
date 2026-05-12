import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMRequest,
} from '../../interfaces/llm-provider.interface';
import { UnexpectedContentTypeException } from './unexpected-content-type.exception';
import { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';
import { RateLimitedQueue } from '@hub/shared-infra';

export type AnthropicGenerateOptions = MessageCreateParamsNonStreaming;

const INTERVAL_MS = 60000;
const MAX_PER_INTERVAL = 45;
const CONCURRENCY = 20;

@Injectable()
export class AnthropicProvider implements LLMProvider {
  private readonly _anthropic: Anthropic;
  private readonly _model: string;
  private readonly _rateLimitedQueue = new RateLimitedQueue({
    intervalMs: INTERVAL_MS,
    maxPerInterval: MAX_PER_INTERVAL,
    concurrency: CONCURRENCY,
  });

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    const timeout = parseInt(
      this._configService.get('ANTHROPIC_REQUEST_TIMEOUT') ?? '30000', // Default to 30 seconds
    );
    this._model =
      this._configService.get<string>('ANTHROPIC_DEFAULT_MODEL') ??
      'claude-sonnet-4-6';

    this._anthropic = new Anthropic({
      apiKey,
      timeout,
    });
  }

  async generate(request: LLMRequest): Promise<string> {
    return this._rateLimitedQueue.add(async () => {
      return this.generateResponse(request);
    });
  }

  private async generateResponse(request: LLMRequest): Promise<string> {
    const response = await this._anthropic.messages.create({
      model: this._model,
      max_tokens: request.maxTokens,
      system: request.system,
      messages: request.messages,
    });
    if (response.content[0].type !== 'text') {
      throw new UnexpectedContentTypeException(response);
    }
    return response.content[0].text;
  }

  async generateWithOptions(options: AnthropicGenerateOptions) {
    return this._rateLimitedQueue.add(async () => {
      return this.generateWithOptionsResponse(options);
    });
  }

  private async generateWithOptionsResponse(
    options: AnthropicGenerateOptions,
  ): Promise<string> {
    const response = await this._anthropic.messages.create(options);
    if (response.content[0].type !== 'text') {
      throw new UnexpectedContentTypeException(response);
    }
    return response.content[0].text;
  }
}
