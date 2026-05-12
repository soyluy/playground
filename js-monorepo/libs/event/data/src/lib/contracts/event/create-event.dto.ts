import { EventItem } from '../../types';

export interface CreateEventDto {
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
}

export type CreateEventResponse = EventItem;
