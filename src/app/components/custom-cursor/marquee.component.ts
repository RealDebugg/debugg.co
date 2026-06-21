import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="marquee-container relative max-w-35 overflow-hidden whitespace-nowrap bg-black text-white">
      @for (key of [marqueeKey()]; track key) {
        <span
          class="inline-flex w-max whitespace-nowrap"
          [style.animation]="'marquee-translate 7s linear infinite'"
        >
          <span>{{ text }}&nbsp;</span>
          <span>{{ text }}&nbsp;</span>
        </span>
      }
    </span>
  `
})
export class MarqueeComponent implements OnChanges {
  @Input() text: string = '';

  marqueeKey = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text']) {
      this.marqueeKey.update(prev => prev + 1);
    }
  }
}
