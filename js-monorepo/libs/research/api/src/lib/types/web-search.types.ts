import { Subtopic } from './subtopic.types';

export type WebSearchResultItem = {
  title: string;
  url: string;
  content: string;
};

export type WebSearchResult = {
  subtopic: Subtopic;
  results: WebSearchResultItem[];
};
