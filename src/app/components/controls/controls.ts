import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
  styleUrl: './controls.scss',
})
export class Controls {
  weatherService = inject(WeatherService);
  musicService = inject(MusicService);

  get mutedRain() {
    return this.weatherService.mutedRain();
  }

  get mutedMusic() {
    return this.musicService.mutedMusic();
  }

  get disableRain() {
    return this.weatherService.rainStopped();
  }
}
