import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMRequest,
} from '../../interfaces/llm-provider.interface';
import { UnexpectedContentTypeException } from './unexpected-content-type.exception';
import { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';

export type AnthropicGenerateOptions = MessageCreateParamsNonStreaming;

@Injectable()
export class AnthropicProvider implements LLMProvider {
  private readonly _anthropic: Anthropic;
  private readonly _model: string;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    const timeout =
      this._configService.get<number>('ANTHROPIC_REQUEST_TIMEOUT') ?? 30000; // Default to 30 seconds
    this._model =
      this._configService.get<string>('ANTHROPIC_DEFAULT_MODEL') ??
      'claude-sonnet-4-6';

    this._anthropic = new Anthropic({
      apiKey,
      timeout,
    });
  }

  async generate(request: LLMRequest): Promise<string> {
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
    const response = await this._anthropic.messages.create(options);
    if (response.content[0].type !== 'text') {
      throw new UnexpectedContentTypeException(response);
    }
    return response.content[0].text;
  }
}
