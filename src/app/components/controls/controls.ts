import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
  styleUrl: './controls.scss',
})
export class Controls implements AfterViewInit {
  @ViewChild('music') musicRef!: ElementRef<HTMLAudioElement>;

  muted = false;
  private started = false;

  private startOnGesture = (): void => {
    if (this.started) return;
    this.started = true;
    document.removeEventListener('click', this.startOnGesture);
    document.removeEventListener('keydown', this.startOnGesture);
    this.applyMute();
    const music = this.musicRef?.nativeElement;
    if (!music) return;
    if (!this.muted) {
      void music.play();
      music.volume = 0.1;
    }
  };

  toggleMute(muted: boolean): void {
    this.muted = muted;
    this.applyMute();
    if (!this.started) return;
    const music = this.musicRef?.nativeElement;
    if (!music) return;
    if (this.muted) {
      music.pause();
    } else if (document.visibilityState === 'visible') {
      void music.play();
      music.volume = 0.1;
    }
  }

  private applyMute(): void {
    const music = this.musicRef?.nativeElement;
    if (music) music.muted = this.muted;
  }

  private syncPlaybackWithVisibility(): void {
    if (!this.started || this.muted) return;
    const music = this.musicRef?.nativeElement;
    if (!music) return;

    if (document.visibilityState === 'visible') {
      void music.play();
      music.volume = 0.1;
    } else {
      music.pause();
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.syncPlaybackWithVisibility();
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.startOnGesture);
    document.addEventListener('keydown', this.startOnGesture);
  }
}
