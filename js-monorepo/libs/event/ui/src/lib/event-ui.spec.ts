import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventUi } from './event-ui';

describe('EventUi', () => {
  let component: EventUi;
  let fixture: ComponentFixture<EventUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventUi],
    }).compileComponents();

    fixture = TestBed.createComponent(EventUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
