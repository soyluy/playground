import { Injectable } from '@nestjs/common';
import { Subtopic, WebSearchResultItem } from '../types';

export type WebSearchResult = {
  results: WebSearchResultItem[];
};

@Injectable()
export class WebSearchService {
  public async searchWeb(subtopic: Subtopic): Promise<WebSearchResult> {
    // TODO: Implement web search
    return {
      results: [],
    };
  }
}
