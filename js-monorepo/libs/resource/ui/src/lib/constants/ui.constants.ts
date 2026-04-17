import { ResourceStatus, ResourceType } from '@hub/resource-data';

export const DEFAULT_RESOURCE_LIMIT = 20;
export const DEFAULT_RESOURCE_OFFSET = 0;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  ARTICLE: 'Article',
  BOOK: 'Book',
  PAPER: 'Paper',
  VIDEO: 'Video',
  LINK: 'Link',
  NOTE: 'Note',
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  WANT_TO_CONSUME: 'Want to Consume',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};
