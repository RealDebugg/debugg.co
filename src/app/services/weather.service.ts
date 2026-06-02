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
  rainStopped = signal(localStorage.getItem('disablerain') === '1');
  private thunderPlaying = false;
  isThunder = false;
  private dynamicStyle!: HTMLStyleElement;

  private rainCanvas!: HTMLCanvasElement;
  private rainCtx!: CanvasRenderingContext2D;
  private rainDrops: Array<{
    x: number;
    y: number;
    endX: number;
    endY: number;
    wait: number;
    createdAt: number;
  }> = [];
  private rainElements: HTMLElement[] = [];
  private rects = new WeakMap<Element, DOMRect>();
  private spawnIntervalId?: number;
  private parameterIntervalId?: number;
  private rainUpdateFrameId?: number;
  private lastScroll = 0;
  private paused = false;
  private defaultLength = 50;
  private length = 50;
  private defaultSpeed = 15;
  private speed = 15;
  private angle = (90 * Math.PI) / 180;
  private angleSin = Math.sin(this.angle);
  private angleCos = Math.cos(this.angle);
  private currentSpawnDelay = 2;
  private gradient!: CanvasGradient;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      this.setupDynamicStyle();
      this.setupRainCanvas();
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

  private setupRainCanvas(): void {
    if (this.rainStopped() || typeof document === 'undefined') return;

    this.rainCanvas = document.createElement('canvas');
    this.rainCanvas.id = 'rain-canvas';
    Object.assign(this.rainCanvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      pointerEvents: 'none',
      zIndex: '1',
      display: 'block',
    });
    document.body.append(this.rainCanvas);

    const context = this.rainCanvas.getContext('2d');
    if (!context) return;
    this.rainCtx = context;

    this.rainElements = Array.from(document.getElementsByClassName('rain-hitbox')) as HTMLElement[];

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (this.rainStopped()) return;
      this.paused = document.hidden;
    });

    this.onResize();
    this.updateRainParameters();
    this.resetSpawnInterval(this.currentSpawnDelay);
    if (this.parameterIntervalId) {
      window.clearInterval(this.parameterIntervalId);
    }
    this.parameterIntervalId = window.setInterval(() => this.updateRainParameters(), 1000);
    this.updateRain();
  }

  private onResize(): void {
    if (!this.rainCanvas || !this.rainCtx) return;

    this.rainCanvas.width = window.innerWidth;
    this.rainCanvas.height = window.innerHeight;
    this.rainCanvas.style.width = `${window.innerWidth}px`;
    this.rainCanvas.style.height = `${window.innerHeight}px`;

    this.rects = new WeakMap<Element, DOMRect>();

    this.gradient = this.rainCtx.createLinearGradient(0, 0, 0, this.rainCanvas.height);
    this.gradient.addColorStop(0, '#55a8ff');
    this.gradient.addColorStop(1, 'white');
    this.rainCtx.lineWidth = 1;
    this.rainCtx.lineCap = 'round';
    this.rainCtx.strokeStyle = this.gradient;
  }

  private onScroll(): void {
    this.lastScroll = Date.now();
  }

  private stopRainVisuals(): void {
    if (this.spawnIntervalId) {
      window.clearInterval(this.spawnIntervalId);
      this.spawnIntervalId = undefined;
    }
    if (this.parameterIntervalId) {
      window.clearInterval(this.parameterIntervalId);
      this.parameterIntervalId = undefined;
    }
    if (this.rainUpdateFrameId !== undefined) {
      window.cancelAnimationFrame(this.rainUpdateFrameId);
      this.rainUpdateFrameId = undefined;
    }
  }

  private resumeRainVisuals(): void {
    if (!this.rainCanvas || !this.rainCtx) {
      this.setupRainCanvas();
      return;
    }

    this.onResize();
    this.updateRainParameters();
    this.resetSpawnInterval(this.currentSpawnDelay);
    if (!this.parameterIntervalId) {
      this.parameterIntervalId = window.setInterval(() => this.updateRainParameters(), 1000);
    }
    this.updateRain();
  }

  private updateRainParameters(): void {
    const x = Date.now() / 1000000;
    const power = Math.sin(2 * Math.PI * (2 * x - Math.cos(x))) / 2 + 0.5;

    this.angle = ((90 + Math.sin(x) * 1.25) * Math.PI) / 180;
    this.angleSin = Math.sin(this.angle);
    this.angleCos = Math.cos(this.angle);
    this.speed = Math.floor(this.defaultSpeed + power * 6);

    const power2 = Math.sin(Date.now() / 90000000);
    const power3 = Math.sin((Date.now() - 1000) / 90000000);

    if (power3 < 0.99 && power2 >= 0.99) {
      this.resetSpawnInterval(1);
    }
    if (power3 >= 0.99 && power2 < 0.99) {
      this.resetSpawnInterval(100);
    }

    if (power2 >= 0.99 || this.forceThunder) {
      this.speed *= 2;
      this.length = this.defaultLength * 2;
      this.angle = ((90 + Math.sin(x) * 3) * Math.PI) / 180;
      this.angleSin = Math.sin(this.angle);
      this.angleCos = Math.cos(this.angle);
    } else {
      this.length = this.defaultLength;
    }
  }

  private resetSpawnInterval(delay: number): void {
    if (this.spawnIntervalId) {
      window.clearInterval(this.spawnIntervalId);
    }
    this.currentSpawnDelay = delay;
    this.spawnIntervalId = window.setInterval(() => this.newDrop(), delay);
  }

  private newDrop(): void {
    if (!this.rainCanvas || this.rainDrops.length > 100) return;
    this.rainDrops.push({
      x: Math.random() * this.rainCanvas.width,
      y: -40 - 100 * Math.random(),
      endX: 0,
      endY: 0,
      wait: 0,
      createdAt: Date.now(),
    });
  }

  private updateRain(): void {
    if (this.rainStopped() || !this.rainCtx || !this.rainCanvas) return;

    if (this.paused) {
      this.rainUpdateFrameId = window.requestAnimationFrame(() => this.updateRain());
      return;
    }

    if (this.lastScroll && Date.now() - this.lastScroll > 10) {
      this.rects = new WeakMap<Element, DOMRect>();
      this.lastScroll = 0;
    }

    const now = Date.now();
    const rawCfps = (window as any).cfps;
    const cfps = typeof rawCfps === 'number' && rawCfps > 0 ? rawCfps : 60;
    const adjustedSpeed = Math.round((this.speed * 60) / cfps);

    this.rainCtx.clearRect(0, 0, this.rainCanvas.width, this.rainCanvas.height);
    this.rainCtx.beginPath();

    for (let i = this.rainDrops.length - 1; i >= 0; i--) {
      const drop = this.rainDrops[i];
      if (now < drop.wait) continue;

      drop.x += adjustedSpeed * this.angleCos;
      drop.y += adjustedSpeed * this.angleSin;
      drop.endX = drop.x + this.length * this.angleCos;
      drop.endY = drop.y + this.length * this.angleSin;

      this.rainCtx.moveTo(Math.floor(drop.x), Math.floor(drop.y));
      this.rainCtx.lineTo(Math.floor(drop.endX), Math.floor(drop.endY));

      if (drop.y > this.rainCanvas.height) {
        drop.x = Math.random() * this.rainCanvas.width;
        drop.endX = drop.x + this.length * this.angleCos;
        drop.y = -50;
        drop.endY = -50 + this.length * this.angleSin;
        drop.wait = now + Math.random() * 300;
      }
    }

    this.rainCtx.stroke();
    this.clearRegions();

    this.rainUpdateFrameId = window.requestAnimationFrame(() => this.updateRain());
  }

  private clearRegions(): void {
    if (this.rainStopped() || !this.rainCtx || this.rainElements.length === 0) return;

    this.rainCtx.globalCompositeOperation = 'destination-out';

    for (const element of this.rainElements) {
      const boundingBox = this.getRect(element);
      const yDistanceBottom = this.rainCanvas.height - boundingBox.bottom;
      const yDistanceTop = this.rainCanvas.height - boundingBox.top;
      const bottomLeftX = boundingBox.left + yDistanceBottom * Math.tan(Math.PI / 2 - this.angle);
      const bottomRightX = boundingBox.right + yDistanceBottom * Math.tan(Math.PI / 2 - this.angle);
      const bottomLeftX2 = boundingBox.left + yDistanceTop * Math.tan(Math.PI / 2 - this.angle);
      const bottomRightX2 = boundingBox.right + yDistanceTop * Math.tan(Math.PI / 2 - this.angle);

      this.rainCtx.beginPath();
      this.rainCtx.moveTo(boundingBox.left, boundingBox.bottom);
      this.rainCtx.lineTo(bottomLeftX, this.rainCanvas.height);
      this.rainCtx.lineTo(bottomRightX, this.rainCanvas.height);
      this.rainCtx.lineTo(boundingBox.right, boundingBox.bottom);
      this.rainCtx.closePath();
      this.rainCtx.fill();

      this.rainCtx.beginPath();
      this.rainCtx.moveTo(boundingBox.left, boundingBox.top);
      this.rainCtx.lineTo(bottomLeftX2, this.rainCanvas.height);
      this.rainCtx.lineTo(bottomRightX2, this.rainCanvas.height);
      this.rainCtx.lineTo(boundingBox.right, boundingBox.top);
      this.rainCtx.closePath();
      this.rainCtx.fill();
    }

    this.rainCtx.globalCompositeOperation = 'source-over';
  }

  private getRect(el: Element): DOMRect {
    const stored = this.rects.get(el);
    if (stored) return stored;
    const rect = el.getBoundingClientRect();
    this.rects.set(el, rect);
    return rect;
  }

  private setupAudio(): void {
    const power = Math.sin(Date.now() / 90000000);
    this.isThunder = power >= 0.99 || this.forceThunder;

    this.log('[setupAudio] Initializing audio, isThunder:', this.isThunder);

    this.rainBgm = new Audio(this.isThunder ? '/rain/heavy.mp3' : '/rain/light.mp3');
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
    this.log(
      '[playAudio] Attempting to play, muted:',
      this.mutedRain(),
      'rainStopped:',
      this.rainStopped(),
    );
    if (this.mutedRain() || this.rainStopped()) return;

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
        if (!this.mutedRain() && !this.rainStopped()) void this.rainBgm.play();
        this.isThunder = true;

        if (!this.thunderBgm) {
          this.thunderBgm = new Audio('/thunder/RainQuietThunder.mp3');
          this.thunderBgm.loop = true;
          document.body.append(this.thunderBgm);
          this.log('[startWeatherCycle] Created new Thunder BGM');
        }
        if (!this.mutedRain() && !this.rainStopped()) void this.thunderBgm.play();
        this.playThunder();
      }

      if (wasThunder && !shouldBeThunder) {
        this.log('[startWeatherCycle] Transitioning FROM thunder');
        this.rainBgm.src = '/rain/light.mp3';
        if (!this.mutedRain() && !this.rainStopped()) void this.rainBgm.play();
        this.isThunder = false;
        if (this.thunderBgm) this.thunderBgm.pause();
      }
    }, 1000);
  }

  private playThunder(): void {
    this.log(
      '[playThunder] Attempting, thunderPlaying:',
      this.thunderPlaying,
      'rainStopped:',
      this.rainStopped,
    );
    if (this.thunderPlaying || this.rainStopped()) return;

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
      if (this.rainStopped()) {
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

    if (!this.mutedRain() && !this.rainStopped()) {
      audio
        .play()
        .then(() => {
          this.log('[playThunder] Thunder audio started playing');
          this.thunderPlaying = true;
          renderFrame();
        })
        .catch((err) => {
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

    if (document.visibilityState !== 'visible' || this.rainStopped()) {
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

  toggleRain(stopped: boolean): void {
    this.rainStopped.set(stopped);
    localStorage.setItem('disablerain', stopped ? '1' : '0');

    if (stopped) {
      this.stopRainVisuals();
      this.paused = true;
      if (this.rainBgm) {
        this.rainBgm.pause();
        this.rainBgm.muted = true;
      }
      if (this.thunderBgm) {
        this.thunderBgm.pause();
        this.thunderBgm.muted = true;
      }
      if (this.activeThunderClip && !this.activeThunderClip.paused) {
        this.activeThunderClip.pause();
        this.activeThunderClip.muted = true;
      }
      if (this.rainCtx && this.rainCanvas) {
        this.rainCtx.clearRect(0, 0, this.rainCanvas.width, this.rainCanvas.height);
      }
      if (this.rainCanvas) {
        this.rainCanvas.style.display = 'none';
      }
      this.dynamicStyle.innerHTML = '';
      return;
    }

    if (this.rainCanvas) {
      this.rainCanvas.style.display = 'block';
    }
    this.paused = false;
    this.resumeRainVisuals();

    const shouldMute = this.mutedRain() || document.visibilityState !== 'visible';
    this.rainBgm.muted = shouldMute;
    if (this.thunderBgm) this.thunderBgm.muted = shouldMute;
    if (this.activeThunderClip) this.activeThunderClip.muted = shouldMute;

    if (!shouldMute) {
      void this.rainBgm.play().catch((err) => {
        this.log('[toggleRain] Rain resume failed:', err);
      });
      if (this.thunderBgm && this.isThunder) {
        void this.thunderBgm.play().catch((err) => {
          this.log('[toggleRain] Thunder resume failed:', err);
        });
      }
    }
  }

  private log(...args: any[]): void {
    if (this.debug) console.log('[WeatherService]', ...args);
  }
}
