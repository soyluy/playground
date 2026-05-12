import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventService } from './services/event.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatList, MatListItem } from '@angular/material/list';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'event-calendar',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatList,
    MatListItem,
    DatePipe,
  ],
  templateUrl: './event.html',
  styleUrl: './event.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCalendar {
  private readonly _eventService = inject(EventService);

  protected events = this._eventService.getEvents();
}
