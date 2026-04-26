import { Module } from '@nestjs/common';
import { AnthropicProvider } from './providers/anthropic';
import { LLM } from './constants/injection-token.constants';

@Module({
  controllers: [],
  providers: [
    {
      provide: LLM,
      useClass: AnthropicProvider, // TODO: Add other providers here
    },
  ],
  exports: [LLM],
})
export class LLMModule {}
