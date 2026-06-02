import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class HonkService {
  private honkSfx!: HTMLAudioElement;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.setupSfx();
    }, 2000);
  }

  private setupSfx(): void {
    if (this.honkSfx) return;

    this.honkSfx = new Audio("/effects/honk.mp3");
    this.honkSfx.preload = 'auto';
    this.honkSfx.volume = 0.2;
    document.body.append(this.honkSfx);
  }

  honk(): void {
    if (!this.honkSfx) {
      this.setupSfx();
    }

    // Restart from the beginning so rapid clicks still produce sound.
    this.honkSfx.currentTime = 0;
    void this.honkSfx.play().catch(() => {
      // Ignore blocked playback errors; next user gesture will retry.
    });
  }
}
