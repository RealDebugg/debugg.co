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
    this.honkSfx = new Audio("/effects/honk.mp3");
    this.honkSfx.volume = 0.2;
    document.body.append(this.honkSfx);
  }

  honk(): void {
    this.honkSfx.play();
  }
}
