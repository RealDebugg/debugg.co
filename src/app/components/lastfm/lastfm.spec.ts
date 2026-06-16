import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lastfm } from './lastfm';

describe('Lastfm', () => {
  let component: Lastfm;
  let fixture: ComponentFixture<Lastfm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lastfm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lastfm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
