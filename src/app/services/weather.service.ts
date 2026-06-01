import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  mutedRain = signal(localStorage.getItem('muterain') === '1');
  private debug = false; // Set to false to disable debug logs
  private forceThunder = false; // Set to true to test thunder effects
  private rainBgm!: HTMLAudioElement;
  private thunderBgm!: HTMLAudioElement;
  private activeThunderClip: HTMLAudioElement | null = null;
  private rainStopped = localStorage.getItem('disablerain') === '1';
  private thunderPlaying = false;
  isThunder = false;
  private dynamicStyle!: HTMLStyleElement;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.setupDynamicStyle();
      this.setupAudio();
      this.setupEventListeners();
      this.startWeatherCycle();
    }, 2000);
  }

  private setupDynamicStyle(): void {
    this.dynamicStyle = document.getElementById('dynamic-style') as HTMLStyleElement;
    if (!this.dynamicStyle) {
      this.dynamicStyle = document.createElement('style');
      this.dynamicStyle.id = 'dynamic-style';
      document.head.append(this.dynamicStyle);
    }
  }

  private setupAudio(): void {
    const power = Math.sin(Date.now() / 90000000);
    this.isThunder = power >= 0.99 || this.forceThunder;

    this.log('[setupAudio] Initializing audio, isThunder:', this.isThunder);

    this.rainBgm = new Audio(
      this.isThunder ? '/rain/heavy.mp3' : '/rain/light.mp3'
    );
    this.rainBgm.loop = true;
    this.rainBgm.volume = 0.2;
    document.body.append(this.rainBgm);

    if (this.isThunder) {
      this.thunderBgm = new Audio('/thunder/RainQuietThunder.mp3');
      this.thunderBgm.loop = true;
      document.body.append(this.thunderBgm);
      this.log('[setupAudio] Thunder BGM created');
    }

    this.playAudio();
    if (this.isThunder) {
      this.log('[setupAudio] Starting thunder loop on init');
      this.playThunder();
    }
  }

  private playAudio(): void {
    this.log('[playAudio] Attempting to play, muted:', this.mutedRain(), 'rainStopped:', this.rainStopped);
    if (this.mutedRain() || this.rainStopped) return;

    this.rainBgm.play().catch((err) => {
      this.log('[playAudio] Rain play failed, waiting for click:', err);
      document.addEventListener('click', () => this.rainBgm.play(), { once: true });
    });

    if (this.thunderBgm && this.isThunder) {
      this.thunderBgm.play().catch((err) => {
        this.log('[playAudio] Thunder BGM play failed:', err);
        document.addEventListener('click', () => this.thunderBgm.play(), { once: true });
      });
    }
  }

  private setupEventListeners(): void {
    document.addEventListener('visibilitychange', () => {
      const visible = document.visibilityState === 'visible';
      const shouldMute = !visible || this.mutedRain();

      this.rainBgm.muted = shouldMute;
      if (this.thunderBgm) this.thunderBgm.muted = shouldMute;
      if (this.activeThunderClip) {
        this.activeThunderClip.muted = shouldMute;
      }

      if (!visible && this.activeThunderClip && !this.activeThunderClip.paused) {
        this.log('[visibilitychange] Pausing active thunder clip');
        this.activeThunderClip.pause();
      }

      if (
        visible &&
        !this.mutedRain() &&
        this.activeThunderClip &&
        this.activeThunderClip.paused &&
        !this.activeThunderClip.ended
      ) {
        this.log('[visibilitychange] Resuming active thunder clip');
        void this.activeThunderClip.play().catch((err) => {
          this.log('[visibilitychange] Resume thunder clip failed:', err);
        });
      }
    });
  }

  private startWeatherCycle(): void {
    setInterval(() => {
      const x = Date.now() / 1000000;
      const power = Math.sin(2 * Math.PI * (2 * x - Math.cos(x))) / 2 + 0.5;

      const power2 = Math.sin(Date.now() / 90000000);
      const shouldBeThunder = this.forceThunder || power2 >= 0.99;
      const wasThunder = this.isThunder;

      if (!wasThunder && shouldBeThunder) {
        this.log('[startWeatherCycle] Transitioning TO thunder');
        this.rainBgm.src = '/rain/heavy.mp3';
        if (!this.mutedRain() && !this.rainStopped) void this.rainBgm.play();
        this.isThunder = true;

        if (!this.thunderBgm) {
          this.thunderBgm = new Audio('/thunder/RainQuietThunder.mp3');
          this.thunderBgm.loop = true;
          document.body.append(this.thunderBgm);
          this.log('[startWeatherCycle] Created new Thunder BGM');
        }
        if (!this.mutedRain() && !this.rainStopped) void this.thunderBgm.play();
        this.playThunder();
      }

      if (wasThunder && !shouldBeThunder) {
        this.log('[startWeatherCycle] Transitioning FROM thunder');
        this.rainBgm.src = '/rain/light.mp3';
        if (!this.mutedRain() && !this.rainStopped) void this.rainBgm.play();
        this.isThunder = false;
        if (this.thunderBgm) this.thunderBgm.pause();
      }
    }, 1000);
  }

  private playThunder(): void {
    this.log('[playThunder] Attempting, thunderPlaying:', this.thunderPlaying, 'rainStopped:', this.rainStopped);
    if (this.thunderPlaying || this.rainStopped) return;

    if (this.mutedRain() || document.visibilityState !== 'visible') {
      this.log('[playThunder] Skipped due to mute/hidden tab');
      if (this.isThunder) {
        setTimeout(() => this.playThunder(), 10000 + Math.floor(Math.random() * 20000));
      }
      return;
    }

    const thunderNum = Math.floor(Math.random() * 5) + 1;
    const audio = new Audio(`/thunder/${thunderNum}.mp3`);
    this.activeThunderClip = audio;
    this.log('[playThunder] Created Audio element for thunder:', thunderNum);

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    const audioSrc = ctx.createMediaElementSource(audio);
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);

    const renderFrame = (): void => {
      if (this.rainStopped) {
        this.thunderPlaying = false;
        return;
      }

      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const value = array.reduce((a, b) => a + b, 0);

      if (value > 7000) {
        this.dynamicStyle.innerHTML = `
          .container {
            filter: brightness(${(value / 6000).toFixed(3)});
          }
        `;
      } else {
        this.dynamicStyle.innerHTML = '';
      }

      if (audio.ended) {
        this.log('[playThunder] Thunder audio ended');
        this.thunderPlaying = false;
        this.activeThunderClip = null;
        this.dynamicStyle.innerHTML = '';
        return;
      }
      requestAnimationFrame(renderFrame);
    };

    if (!this.mutedRain() && !this.rainStopped) {
      audio.play().then(() => {
        this.log('[playThunder] Thunder audio started playing');
        this.thunderPlaying = true;
        renderFrame();
      }).catch((err) => {
        this.log('[playThunder] Failed to play thunder audio:', err);
        this.activeThunderClip = null;
      });
    }

    if (this.isThunder) {
      setTimeout(() => this.playThunder(), 10000 + Math.floor(Math.random() * 20000));
    }
  }

  toggleMute(muted: boolean): void {
    this.mutedRain.set(muted);
    localStorage.setItem('muterain', muted ? '1' : '0');

    this.rainBgm.muted = muted;
    if (this.thunderBgm) this.thunderBgm.muted = muted;
    if (this.activeThunderClip) this.activeThunderClip.muted = muted;

    if (muted) {
      this.rainBgm.pause();
      if (this.thunderBgm) this.thunderBgm.pause();
      if (this.activeThunderClip && !this.activeThunderClip.paused) {
        this.activeThunderClip.pause();
      }
      this.dynamicStyle.innerHTML = '';
      this.log('[toggleMute] Muted all weather audio');
      return;
    }

    if (document.visibilityState !== 'visible' || this.rainStopped) {
      this.log('[toggleMute] Unmuted but tab hidden or rain stopped');
      return;
    }

    void this.rainBgm.play().catch((err) => {
      this.log('[toggleMute] Rain resume failed:', err);
    });

    if (this.thunderBgm && this.isThunder) {
      void this.thunderBgm.play().catch((err) => {
        this.log('[toggleMute] Thunder BGM resume failed:', err);
      });
    }

    if (this.isThunder && !this.thunderPlaying) {
      this.playThunder();
    }
  }

  private log(...args: any[]): void {
    if (this.debug) console.log('[WeatherService]', ...args);
  }
}
