import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerWithDots } from './container-with-dots';

describe('ContainerWithDots', () => {
  let component: ContainerWithDots;
  let fixture: ComponentFixture<ContainerWithDots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerWithDots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerWithDots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
