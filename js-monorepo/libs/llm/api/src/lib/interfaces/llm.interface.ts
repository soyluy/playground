export interface LLM {
  generate(request: LLMRequest): Promise<string>;
}

export interface LLMRequest {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens: number;
}
