import { Injectable } from '@angular/core';

export type ContactSfxKey = 'antenna' | 'button' | 'ruedita';


/* TODO: If not page visible, mute */
@Injectable({
  providedIn: 'root',
})
export class ContactSfxService {
  private readonly sfxFiles: Record<ContactSfxKey, string> = {
    antenna: '/effects/contact-antenna.mp3',
    button: '/effects/contact-button.mp3',
    ruedita: '/effects/contact-knob.mp3',
  };

  private sfxPlayers: Partial<Record<ContactSfxKey, HTMLAudioElement>> = {};

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.setupPlayers();
    }, 2000);
  }

  private setupPlayers(): void {
    (Object.keys(this.sfxFiles) as ContactSfxKey[]).forEach((key) => {
      if (this.sfxPlayers[key]) {
        return;
      }

      const player = new Audio(this.sfxFiles[key]);
      player.preload = 'auto';
      player.volume = 0.25;
      document.body.append(player);
      this.sfxPlayers[key] = player;
    });
  }

  play(effect: ContactSfxKey): void {
    if (!this.sfxPlayers[effect]) {
      this.setupPlayers();
    }

    const player = this.sfxPlayers[effect];
    if (!player) {
      return;
    }

    player.currentTime = 0;
    void player.play().catch(() => {
      // Ignore blocked playback errors; user interaction will unblock future plays.
    });
  }
}
