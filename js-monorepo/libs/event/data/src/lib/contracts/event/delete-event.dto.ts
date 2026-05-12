import { EventItem } from '../../types';

export interface DeleteEventDto {
  id: string;
}

export type DeleteEventResponse = EventItem;
