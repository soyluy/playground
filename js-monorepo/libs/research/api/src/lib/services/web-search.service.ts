import { Injectable } from '@nestjs/common';
import { Subtopic, WebSearchResult, WebSearchResultItem } from '../types';
import { ConfigService } from '@nestjs/config';
import { tavily, TavilyClient, TavilySearchOptions } from '@tavily/core';

const SEARCH_OPTIONS: TavilySearchOptions = {
  searchDepth: 'advanced',
  topic: 'general',
  maxResults: 10,
  include: 'text',
};

@Injectable()
export class WebSearchService {
  private readonly _tavily: TavilyClient;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.getOrThrow<string>('TAVILY_API_KEY');
    this._tavily = tavily({
      apiKey,
    });
  }

  public async searchWeb(subtopic: Subtopic): Promise<WebSearchResult> {
    const results = await this._tavily.search(subtopic.query, SEARCH_OPTIONS);
    const normalizedResults: WebSearchResultItem[] = results.results.map(
      (result) => ({
        title: result.title,
        url: result.url,
        content: result.rawContent ?? result.content,
      }),
    );
    return {
      results: normalizedResults,
    };
  }
}
