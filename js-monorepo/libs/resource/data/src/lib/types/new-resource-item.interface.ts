import { ResourceStatus } from './resource-status';
import { ResourceType } from './resource-type';

export interface NewResourceItem {
  title: string;
  url?: string;
  description?: string;
  category: string;
  type: ResourceType;
  status: ResourceStatus;
  metadata?: Record<string, unknown>;
}
