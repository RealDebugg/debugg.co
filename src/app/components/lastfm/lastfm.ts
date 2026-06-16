import { Component, OnDestroy, OnInit } from '@angular/core';
import { LastfmService } from '../../services/lastfm.service';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from "../../pipes/date-ago.pipe";

@Component({
  selector: 'app-lastfm',
  imports: [CommonModule, DateAgoPipe],
  templateUrl: './lastfm.html',
  styleUrl: './lastfm.scss',
})
export class Lastfm implements OnInit, OnDestroy {
  constructor(public lastfm: LastfmService) {}

  ngOnInit(): void {
    this.lastfm.startPolling();
  }

  ngOnDestroy(): void {
    this.lastfm.stopPolling();
  }
}
