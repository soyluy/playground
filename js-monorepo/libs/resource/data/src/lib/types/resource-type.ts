export const RESOURCE_TYPES = [
  'ARTICLE',
  'BOOK',
  'PAPER',
  'VIDEO',
  'LINK',
  'NOTE',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];
