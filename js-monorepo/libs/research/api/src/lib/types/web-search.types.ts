export type WebSearchResultItem = {
  title: string;
  url: string;
  content: string;
};

export type WebSearchResult = {
  results: WebSearchResultItem[];
};
