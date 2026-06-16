import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhosphorTrailService implements OnDestroy {
  private trailContainer: HTMLElement | null = null;
  private ghostElements: HTMLElement[] = [];
  private isInitialized = false;
  private ghostIndex = 0;
  private lastTime = 0;
  private mouseX = 0;
  private mouseY = 0;
  private lastMouseMoveTime = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private initTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Defer initialization to ensure DOM is ready
    this.initTimeout = setTimeout(() => this.init(), 100);
  }

  private init(): void {
    if (this.isInitialized) return;

    this.trailContainer = document.getElementById('phosphor-trail');
    if (!this.trailContainer) {
      console.warn('Phosphor trail container not found, retrying...');
      this.initTimeout = setTimeout(() => this.init(), 500);
      return;
    }

    this.initializeGhosts();
    this.setupEventListeners();
    this.isInitialized = true;
  }

  private initializeGhosts(): void {
    if (!this.trailContainer) return;

    // Clear existing ghosts
    this.ghostElements = [];
    this.trailContainer.innerHTML = '';

    // Create 6 ghost elements for the trail
    for (let i = 0; i < 6; i++) {
      const ghost = document.createElement('div');
      ghost.className = 'phosphor-ghost';
      this.trailContainer.appendChild(ghost);
      this.ghostElements.push(ghost);
    }
  }

  private setupEventListeners(): void {
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isInitialized) return;

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.lastMouseMoveTime = performance.now();

    // Clear the hide timeout and reset it
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hideTimeout = setTimeout(() => this.hideCursor(), 3000);

    // Throttle updates to ~20fps (50ms intervals)
    const now = performance.now();
    if (now - this.lastTime < 50) return;
    this.lastTime = now;

    if (this.ghostElements.length === 0) return;

    const ghost = this.ghostElements[this.ghostIndex % 6];
    ghost.style.left = `${this.mouseX - 8}px`;
    ghost.style.top = `${this.mouseY - 10}px`;
    ghost.style.filter = 'blur(0.5px)';
    ghost.style.opacity = '0.2';

    this.ghostIndex++;

    // Fade out the ghost
    requestAnimationFrame(() => {
      setTimeout(() => {
        ghost.style.filter = 'blur(1.5px)';
        ghost.style.opacity = '0';
      }, 450);
    });
  }

  private hideCursor(): void {
    // Hide all ghosts after inactivity
    this.ghostElements.forEach((ghost) => {
      ghost.style.opacity = '0';
    });
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
  }
}
