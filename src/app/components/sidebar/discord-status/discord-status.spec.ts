import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordStatus } from './discord-status';

describe('DiscordStatus', () => {
  let component: DiscordStatus;
  let fixture: ComponentFixture<DiscordStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
