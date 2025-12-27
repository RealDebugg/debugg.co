import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordRedirect } from './discord-redirect';

describe('DiscordRedirect', () => {
  let component: DiscordRedirect;
  let fixture: ComponentFixture<DiscordRedirect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordRedirect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordRedirect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
