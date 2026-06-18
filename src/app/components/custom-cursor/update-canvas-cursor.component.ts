import { Component, OnDestroy, inject, effect } from '@angular/core';
import { MouseService } from '../../services/mouse.service';

/**
 * Component that manages cursor styling for Three.js/WebGL canvas elements.
 * Updates the canvas element's cursor style based on MouseService state.
 */
@Component({
  selector: 'app-update-canvas-cursor',
  standalone: true,
  template: ''
})
export class UpdateCanvasCursorComponent implements OnDestroy {
  private mouseService = inject(MouseService);

  constructor() {
    // Subscribe to cursor type changes and update canvas cursor
    effect(() => {
      this.updateCanvasCursor(this.mouseService.cursorType());
    });
  }

  ngOnDestroy(): void {
    this.resetCanvasCursor();
  }

  private updateCanvasCursor(cursorType: string): void {
    if (typeof window === 'undefined') return;

    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      canvas.style.cursor = cursorType;
    });

    // Also check for any element with role "presentation" or similar canvas-like elements
    const glContainer = document.querySelector('[data-gl-container]');
    if (glContainer) {
      (glContainer as HTMLElement).style.cursor = cursorType;
    }
  }

  private resetCanvasCursor(): void {
    if (typeof window === 'undefined') return;

    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      canvas.style.cursor = 'default';
    });

    const glContainer = document.querySelector('[data-gl-container]');
    if (glContainer) {
      (glContainer as HTMLElement).style.cursor = 'default';
    }
  }
}
