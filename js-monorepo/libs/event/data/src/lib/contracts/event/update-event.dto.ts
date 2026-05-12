import { EventItem } from '../../types';

export interface UpdateEventDto {
  title: string | null;
  description: string | null;
  startTime: Date | null;
  endTime: Date | null;
}

export type UpdateEventResponse = EventItem;
