import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateEventDto,
  CreateEventResponse,
  DeleteEventResponse,
  EventItem,
  GetEventsResponse,
  UpdateEventDto,
  UpdateEventResponse,
} from '@hub/event-data';
import { Observable } from 'rxjs';
import { EVENT_ROUTES } from '../constants/route.constants';
import { UrlBuilderService } from '../util/url-builder';

@Injectable({ providedIn: 'root' })
export class EventApiService {
  private readonly _http = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  public getEvents(): Observable<GetEventsResponse> {
    const url = this._urlBuilder.urlBuilder(EVENT_ROUTES.GET_ALL);
    return this._http.get<GetEventsResponse>(url);
  }

  public createEvent(event: CreateEventDto): Observable<CreateEventResponse> {
    const url = this._urlBuilder.urlBuilder(EVENT_ROUTES.CREATE_ONE);
    return this._http.post<CreateEventResponse>(url, event);
  }

  public updateEvent(
    id: string,
    event: UpdateEventDto,
  ): Observable<UpdateEventResponse> {
    const url = this._urlBuilder.urlBuilder(EVENT_ROUTES.UPDATE_ONE(id));
    return this._http.patch<UpdateEventResponse>(url, event);
  }

  public deleteEvent(id: string): Observable<DeleteEventResponse> {
    const url = this._urlBuilder.urlBuilder(EVENT_ROUTES.DELETE_ONE(id));
    return this._http.delete<DeleteEventResponse>(url);
  }

  public getEvent(id: string): Observable<EventItem> {
    const url = this._urlBuilder.urlBuilder(EVENT_ROUTES.GET_ONE(id));
    return this._http.get<EventItem>(url);
  }
}
