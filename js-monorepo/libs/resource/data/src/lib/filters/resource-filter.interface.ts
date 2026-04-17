import { ResourceStatus } from '../types/resource-status';
import { ResourceType } from '../types/resource-type';

export interface ResourceFilter {
  type?: ResourceType;
  status?: ResourceStatus;
  category?: string;
}
