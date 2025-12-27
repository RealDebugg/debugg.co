import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectComponent } from './redirect';

describe('RedirectComponent', () => {
  let component: RedirectComponent;
  let fixture: ComponentFixture<RedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
