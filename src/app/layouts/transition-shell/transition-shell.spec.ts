import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionShell } from './transition-shell';

describe('TransitionShell', () => {
  let component: TransitionShell;
  let fixture: ComponentFixture<TransitionShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransitionShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransitionShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
