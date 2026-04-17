export const DEFAULT_RESOURCE_LIMIT = 20;
export const DEFAULT_RESOURCE_OFFSET = 0;

export const RESOURCE_TYPES = [
  'ARTICLE',
  'BOOK',
  'PAPER',
  'VIDEO',
  'LINK',
  'NOTE',
] as const;

export const RESOURCE_STATUSES = [
  'WANT_TO_CONSUME',
  'IN_PROGRESS',
  'DONE',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface ResourceItem {
  id: string;
  title: string;
  url?: string | null;
  description?: string | null;
  category: string;
  type: ResourceType;
  status: ResourceStatus;
  metadata: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewResourceItem {
  title: string;
  url?: string;
  description?: string;
  category: string;
  type: ResourceType;
  status: ResourceStatus;
  metadata?: Record<string, unknown>;
}

export type UpdateResourceInput = Partial<NewResourceItem>;

export interface ResourceFilter {
  type?: ResourceType;
  status?: ResourceStatus;
  category?: string;
}

export interface ResourceQuery {
  limit?: number;
  offset?: number;
  type?: ResourceType;
  status?: ResourceStatus;
  category?: string;
}

export interface GetResourcesResponse {
  data: ResourceItem[];
  total: number;
  limit: number;
  offset: number;
}

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
