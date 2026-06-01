import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class MusicService {
  mutedMusic = signal(localStorage.getItem('mutemusic') === '1');
  private musicBgm!: HTMLAudioElement;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.initMusic();
      this.setupEventListeners();
    }, 2000);
  }

  toggleMute(muted: boolean): void {
    this.mutedMusic.set(muted);
    localStorage.setItem('mutemusic', muted ? '1' : '0');

    if (muted) {
      this.musicBgm.pause();
      return;
    }

    void this.musicBgm.play().catch((err) => {
      console.error('[toggleMute] Music resume failed:', err);
    });
  }

  private initMusic(): void {
    this.musicBgm = new Audio("/My Castle Town.mp3");
    this.musicBgm.loop = true;
    this.musicBgm.volume = 0.1;
    document.body.append(this.musicBgm);

    if (this.mutedMusic()) return
    this.playMusic();
  }

  private playMusic(): void {
    this.musicBgm.play().catch((_) => {
      document.addEventListener('click', () => this.musicBgm.play(), { once: true });
    });
  }

  private setupEventListeners(): void {
    document.addEventListener('visibilitychange', () => {
      const visible = document.visibilityState === 'visible';
      const shouldMute = !visible || this.mutedMusic();

      if (visible && !shouldMute) {
        this.musicBgm.play();
      } else {
        this.musicBgm.pause();
      }
    });
  }
}
