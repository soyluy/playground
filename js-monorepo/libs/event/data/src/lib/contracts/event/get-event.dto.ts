import { EventItem } from '../../types';

export type GetEventsResponse = {
  data: EventItem[];
  total: number;
};
