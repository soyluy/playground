export interface LLMProvider {
  /**
   * Generates a response from the LLM.
   * @param request - The request to generate a response from.
   * @returns The response from the LLM.
   */
  generate(request: LLMRequest): Promise<string>;
}

export interface LLMRequest {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens: number;
}
