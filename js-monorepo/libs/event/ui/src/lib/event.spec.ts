import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCalendar } from './event';

describe('EventCalendar', () => {
  let component: EventCalendar;
  let fixture: ComponentFixture<EventCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
