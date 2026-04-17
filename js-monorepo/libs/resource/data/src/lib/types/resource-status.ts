export const RESOURCE_STATUSES = [
  'WANT_TO_CONSUME',
  'IN_PROGRESS',
  'DONE',
] as const;

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];
