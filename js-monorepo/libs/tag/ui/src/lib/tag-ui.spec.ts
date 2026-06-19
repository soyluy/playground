import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagUi } from './tag-ui';

describe('TagUi', () => {
  let component: TagUi;
  let fixture: ComponentFixture<TagUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagUi],
    }).compileComponents();

    fixture = TestBed.createComponent(TagUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
