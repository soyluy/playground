import { ResourceItem } from '../types/resource-item.interface';

export interface GetResourcesResponse {
  data: ResourceItem[];
  total: number;
  limit: number;
  offset: number;
}
