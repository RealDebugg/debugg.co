import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MouseService {
  cursorType = signal<string>('default');
  hoverText = signal<string | null>(null);
  marquee = signal<boolean>(false);

  setHoverText(text: string | null, marquee: boolean = false): void {
    this.hoverText.set(text);
    this.marquee.set(marquee);
  }

  resetCursor(): void {
    this.setHoverText(null);
  }
}
