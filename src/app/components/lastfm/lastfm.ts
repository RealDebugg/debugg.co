import { Component, OnDestroy, OnInit } from '@angular/core';
import { LastfmService } from '../../services/lastfm.service';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from "../../pipes/date-ago.pipe";
import { ContainerWithDots } from "../container-with-dots/container-with-dots";

@Component({
  selector: 'app-lastfm',
  imports: [CommonModule, DateAgoPipe, ContainerWithDots],
  templateUrl: './lastfm.html',
  styleUrl: './lastfm.scss',
})
export class Lastfm implements OnInit, OnDestroy {
  constructor(public lastfm: LastfmService) {}

  openTrackLink(): void {
    const url = this.lastfm.track()?.url;
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  ngOnInit(): void {
    this.lastfm.startPolling();
  }

  ngOnDestroy(): void {
    this.lastfm.stopPolling();
  }
}
