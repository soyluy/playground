import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import {
  CreateEventResponse,
  DeleteEventResponse,
  EventItem,
  GetEventsResponse,
  NewEventItem,
  UpdateEventDto,
  UpdateEventResponse,
} from '@hub/event-data';
import { EventApiService } from './event-api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly _apiService = inject(EventApiService);

  private readonly _refresh = signal(0);

  private readonly _events: Signal<EventItem[]>;

  constructor() {
    const eventsResponse$ = toObservable(computed(() => this._refresh())).pipe(
      switchMap(() => this._apiService.getEvents()),
      map((res: GetEventsResponse) => res.data),
    );

    this._events = toSignal(eventsResponse$, { initialValue: [] });
  }

  public getEvents(): Signal<EventItem[]> {
    return this._events;
  }

  public addEvent(event: NewEventItem) {
    const res$ = this._apiService.createEvent(event);
    res$.subscribe({
      next: (res: CreateEventResponse) => {
        this._refreshEvents();
        console.log('event added', res);
      },
      error: (error) => {
        console.error('error adding event', error);
      },
    });
  }

  public updateEvent(id: string, event: UpdateEventDto) {
    const res$ = this._apiService.updateEvent(id, event);
    res$.subscribe({
      next: (res: UpdateEventResponse) => {
        this._refreshEvents();
        console.log('event updated', res);
      },
      error: (error) => {
        console.error('error updating event', error);
      },
    });
  }

  public deleteEvent(id: string) {
    const res$ = this._apiService.deleteEvent(id);
    res$.subscribe({
      next: (res: DeleteEventResponse) => {
        this._refreshEvents();
        console.log('event deleted', res);
      },
      error: (error) => {
        console.error('error deleting event', error);
      },
    });
  }

  public getEvent(id: string): EventItem | undefined {
    return this._events().find((e) => e.id === id);
  }

  private _refreshEvents() {
    this._refresh.update((refresh) => refresh + 1);
  }
}
