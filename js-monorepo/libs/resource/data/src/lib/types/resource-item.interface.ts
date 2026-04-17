import { ResourceStatus } from './resource-status';
import { ResourceType } from './resource-type';

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
