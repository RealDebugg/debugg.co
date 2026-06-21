import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { LastfmService } from '../../services/lastfm.service';
import { MouseService } from '../../services/mouse.service';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from '../../pipes/date-ago.pipe';
import { ContainerWithDots } from '../container-with-dots/container-with-dots';

@Component({
  selector: 'app-lastfm',
  imports: [CommonModule, DateAgoPipe, ContainerWithDots],
  templateUrl: './lastfm.html',
  styleUrl: './lastfm.scss',
})
export class Lastfm implements OnInit, OnDestroy {
  public lastfm = inject(LastfmService);
  private mouseService = inject(MouseService);

  openTrackLink(): void {
    const url = this.lastfm.track()?.url;
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  onHoverEnter(): void {
    this.mouseService.setHoverText('View Song');
  }

  onHoverLeave(): void {
    this.mouseService.resetCursor();
  }

  ngOnInit(): void {
    this.lastfm.startPolling();
  }

  ngOnDestroy(): void {
    this.lastfm.stopPolling();
  }
}
