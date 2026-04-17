import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceUi } from './resource-ui';

describe('ResourceUi', () => {
  let component: ResourceUi;
  let fixture: ComponentFixture<ResourceUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceUi],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
