import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject
} from '@angular/core';
import { animate } from 'motion';

import { WeatherService } from '../../services/weather.service';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
})
export class Controls implements AfterViewInit, OnDestroy {
  weatherService = inject(WeatherService);
  musicService = inject(MusicService);

  @ViewChild('musicSvg')
  svgRef!: ElementRef<SVGSVGElement>;

  private animations: Array<{ cancel: () => void }> = [];
  private initialized = false;

  get mutedMusic() {
    return this.musicService.mutedMusic();
  }

  get disableRain() {
    return this.weatherService.rainStopped();
  }

  constructor() {
    effect(() => {
      const muted = this.musicService.mutedMusic();

      if (!this.initialized || !this.svgRef) return;

      this.updateMusicAnimation(!muted);
    });
  }

  ngAfterViewInit() {
    this.initialized = true;

    this.updateMusicAnimation(!this.musicService.mutedMusic());
  }

  ngOnDestroy() {
    this.cancelAnimations();
  }

  private cancelAnimations() {
    this.animations.forEach(animation => animation?.cancel?.());
    this.animations = [];
  }

  private updateMusicAnimation(isPlaying: boolean) {
    if (!this.svgRef?.nativeElement) return;

    this.cancelAnimations();

    const bars = Array.from(
      this.svgRef.nativeElement.querySelectorAll('rect')
    );

    if (isPlaying) {
      bars.forEach(bar => {
        const maxHeight = Math.floor(Math.random() * 5) + 8;

        const middleY = 6.5;
        const expandedY = 7.5 - maxHeight / 2;
        const randomDelay = Math.random() * 0.5;

        const heightAnimation = animate(
          2,
          maxHeight,
          {
            duration: 0.8,
            delay: randomDelay,
            repeat: Infinity,
            repeatType: 'reverse',
            onUpdate: latest => {
              bar.setAttribute('height', String(latest));
            }
          }
        );

        const yAnimation = animate(
          middleY,
          expandedY,
          {
            duration: 0.8,
            delay: randomDelay,
            repeat: Infinity,
            repeatType: 'reverse',
            onUpdate: latest => {
              bar.setAttribute('y', String(latest));
            }
          }
        );

        this.animations.push(heightAnimation);
        this.animations.push(yAnimation);
      });
    } else {
      bars.forEach(bar => {
        bar.setAttribute('height', '2');
        bar.setAttribute('y', '6.5');
      });
    }
  }
}
