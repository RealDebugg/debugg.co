import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NeonService {
  private neonSfx!: HTMLAudioElement;
  private humBgm!: HTMLAudioElement;
  private unlockRegistered = false;
  private humFadeInterval: ReturnType<typeof setInterval> | null = null;
  private humPulseInterval: ReturnType<typeof setInterval> | null = null;
  private humPulsePhase = 0;
  private humBaseVolume = 0;
  private readonly humTargetVolume = 0.8;
  private readonly humFadeDurationMs = 240;
  private readonly humFadeStepMs = 16;
  private readonly humPulseDepth = 0.1;
  private readonly humPulseStepMs = 60;
  private readonly humPulseSpeed = 0.35;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.setupSfx();
      this.ensureUnlockedOnFirstGesture();
    }, 250);
  }

  private setupSfx(): void {
    if (this.neonSfx && this.humBgm) return;

    if (!this.neonSfx) {
      this.neonSfx = new Audio('/effects/neon.wav');
      this.neonSfx.preload = 'auto';
      this.neonSfx.volume = 0.05;
      document.body.append(this.neonSfx);
    }

    if (!this.humBgm) {
      this.humBgm = new Audio('/effects/hum.mp3');
      this.humBgm.preload = 'auto';
      this.humBgm.loop = true;
      this.humBgm.volume = 0;
      document.body.append(this.humBgm);
    }
  }

  private ensureUnlockedOnFirstGesture(): void {
    if (this.unlockRegistered) return;
    this.unlockRegistered = true;

    const unlock = () => {
      if (!this.neonSfx || !this.humBgm) {
        this.setupSfx();
      }

      this.warmup(this.neonSfx);
      this.warmup(this.humBgm);
    };

    document.addEventListener('click', unlock, { once: true });
  }

  playHover(): void {
    if (!this.neonSfx || !this.humBgm) {
      this.setupSfx();
      this.ensureUnlockedOnFirstGesture();
    }

    this.humBaseVolume = Math.max(0, Math.min(1, this.humTargetVolume));
    this.fadeHumTo(this.humBaseVolume, true);
    this.neonSfx.currentTime = 0;
    void this.neonSfx.play().catch(() => {
      // Ignore blocked playback; click-unlock listener will handle first gesture.
    });
  }

  stopHover(): void {
    if (!this.humBgm) {
      return;
    }

    this.fadeHumTo(0);
  }

  private warmup(audio: HTMLAudioElement): void {
    audio.muted = true;
    audio.currentTime = 0;
    void audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }).catch(() => {
      // If this fails, the next trusted gesture can still unlock it.
    });
  }

  private fadeHumTo(targetVolume: number, startPulseAfterFade = false): void {
    if (!this.humBgm) {
      return;
    }

    this.stopHumPulse(false);

    if (this.humFadeInterval) {
      clearInterval(this.humFadeInterval);
      this.humFadeInterval = null;
    }

    const startVolume = this.humBgm.volume;
    if (Math.abs(startVolume - targetVolume) < 0.001) {
      if (targetVolume <= 0) {
        this.humBgm.pause();
        this.humBgm.currentTime = 0;
      } else if (startPulseAfterFade) {
        this.startHumPulse();
      }
      return;
    }

    if (targetVolume > 0) {
      void this.humBgm.play().catch(() => {
        // Ignore blocked playback; click-unlock listener will handle first gesture.
      });
    }

    const totalSteps = Math.max(1, Math.round(this.humFadeDurationMs / this.humFadeStepMs));
    let step = 0;
    this.humFadeInterval = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / totalSteps);
      this.humBgm.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        if (this.humFadeInterval) {
          clearInterval(this.humFadeInterval);
          this.humFadeInterval = null;
        }

        if (targetVolume <= 0) {
          this.humBgm.pause();
          this.humBgm.currentTime = 0;
        } else if (startPulseAfterFade) {
          this.startHumPulse();
        }
      }
    }, this.humFadeStepMs);
  }

  private startHumPulse(): void {
    if (!this.humBgm || this.humPulseInterval) {
      return;
    }

    const minVolume = Math.max(0, this.humBaseVolume - this.humPulseDepth);
    const maxVolume = Math.min(1, this.humBaseVolume + this.humPulseDepth);
    this.humPulsePhase = 0;

    this.humPulseInterval = setInterval(() => {
      this.humPulsePhase += this.humPulseSpeed;
      const wave = (Math.sin(this.humPulsePhase) + 1) / 2;
      this.humBgm.volume = minVolume + (maxVolume - minVolume) * wave;
    }, this.humPulseStepMs);
  }

  private stopHumPulse(resetToBase: boolean): void {
    if (this.humPulseInterval) {
      clearInterval(this.humPulseInterval);
      this.humPulseInterval = null;
    }

    if (resetToBase && this.humBgm) {
      this.humBgm.volume = this.humBaseVolume;
    }
  }
}
