import { ResourceFilter } from './resource-filter.interface';

export interface ResourceQuery extends ResourceFilter {
  limit?: number;
  offset?: number;
}
