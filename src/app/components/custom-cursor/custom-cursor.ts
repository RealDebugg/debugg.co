import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
  computed,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MouseService } from '../../services/mouse.service';
import { MarqueeComponent } from './marquee.component';

const OFFSET = 30;

const CURSOR_SPRING = { stiffness: 500, damping: 50 };
const TOOLTIP_SPRING = { stiffness: 220, damping: 28 };

interface SpringValue {
  current: number;
  target: number;
  velocity: number;
}

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule, MarqueeComponent],
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CustomCursorComponent implements OnInit, AfterViewInit, OnDestroy {
  private mouseService = inject(MouseService);
  private ngZone = inject(NgZone);

  protected dimensions = signal({ width: 0, height: 0 });

  @ViewChild('tooltipElement')
  tooltipElementRef?: ElementRef<HTMLParagraphElement>;

  @ViewChild('cursorElement')
  cursorElementRef?: ElementRef<HTMLDivElement>;

  @ViewChild('outerCursor')
  outerCursorRef?: ElementRef<HTMLDivElement>;

  @ViewChild('innerCursor')
  innerCursorRef?: ElementRef<HTMLDivElement>;

  private cursorX: SpringValue = { current: 0, target: 0, velocity: 0 };
  private cursorY: SpringValue = { current: 0, target: 0, velocity: 0 };
  protected cursorXSignal = signal(0);
  protected cursorYSignal = signal(0);

  private tooltipX: SpringValue = { current: 0, target: 0, velocity: 0 };
  private tooltipY: SpringValue = { current: 0, target: 0, velocity: 0 };
  protected tooltipXSignal = signal(0);
  protected tooltipYSignal = signal(0);

  protected hoverTextValue = computed(() => this.mouseService.hoverText());
  protected showMarquee = computed(() => this.mouseService.marquee());

  private mouseListener?: (e: MouseEvent) => void;
  private rafId?: number;

  private cursorOverListener?: (e: MouseEvent) => void;
  private cursorOutListener?: (e: MouseEvent) => void;

  ngOnInit(): void {
    this.setupMouse();
    this.setupAnimation();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();
    this.setupCursorModeListeners();
  }

  ngOnDestroy(): void {
    if (this.mouseListener) {
      window.removeEventListener('mousemove', this.mouseListener);
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private setupCursorModeListeners(): void {
    if (typeof document === 'undefined') return;

    this.cursorOverListener = (e: MouseEvent) => {
      this.updateCursorMode(e.target);
    };

    this.cursorOutListener = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget;
      if (
        relatedTarget instanceof Node &&
        this.cursorElementRef?.nativeElement?.contains(relatedTarget)
      ) {
        return;
      }

      this.setCursorMode('default');
    };

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mouseover', this.cursorOverListener!, {
        passive: true,
      });
      document.addEventListener('mouseout', this.cursorOutListener!, {
        passive: true,
      });
    });
  }

  private updateCursorMode(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) {
      this.setCursorMode('default');
      return;
    }

    const cursorOverride = this.getDataCursorMode(target);
    if (cursorOverride) {
      this.setCursorMode(cursorOverride);
      return;
    }

    const isInteractiveElement = target.closest(
      'a, button, input, textarea, select, [role="button"]',
    );

    if (isInteractiveElement) {
      this.setCursorMode('pointer');
      return;
    }

    const isTextElement =
      target.closest('p, h1, h2, h3, h4, h5, h6, span, li, td, th, label, code, pre') ||
      target.isContentEditable;

    if (isTextElement) {
      this.setCursorMode('text');
      return;
    }

    this.setCursorMode('default');
  }

  private getDataCursorMode(target: HTMLElement): 'default' | 'pointer' | 'text' | null {
    const elementWithCursor = target.closest('[data-cursor]');
    if (!elementWithCursor) {
      return null;
    }

    const value = elementWithCursor.getAttribute('data-cursor')?.toLowerCase();
    if (value === 'default' || value === 'pointer' || value === 'text') {
      return value;
    }

    return null;
  }

  private setCursorMode(mode: 'default' | 'pointer' | 'text'): void {
    const outerCursor = this.outerCursorRef?.nativeElement;
    const innerCursor = this.innerCursorRef?.nativeElement;

    if (!outerCursor || !innerCursor) return;

    outerCursor.classList.toggle('pointer', mode === 'pointer');
    innerCursor.classList.toggle('text', mode === 'text');
  }

  private computeTooltipPosition(x: number, y: number) {
    const { width, height } = this.dimensions();

    const topRightX = x + OFFSET;
    const topRightY = y - OFFSET - height;

    const bottomRightY = y + OFFSET;

    const finalX = topRightX + width + 50 > window.innerWidth ? x - OFFSET - width : topRightX;

    const finalY = topRightY < 0 ? bottomRightY : topRightY;

    return { x: finalX, y: finalY };
  }

  private setupMouse(): void {
    this.mouseListener = (e: MouseEvent) => {
      this.cursorX.target = e.clientX;
      this.cursorY.target = e.clientY;
    };

    window.addEventListener('mousemove', this.mouseListener, {
      passive: true,
    });
  }

  private setupAnimation(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.updateSpring(this.cursorX, CURSOR_SPRING);
        this.updateSpring(this.cursorY, CURSOR_SPRING);

        const pos = this.computeTooltipPosition(this.cursorX.current, this.cursorY.current);

        this.tooltipX.target = pos.x;
        this.tooltipY.target = pos.y;

        this.updateSpring(this.tooltipX, TOOLTIP_SPRING);
        this.updateSpring(this.tooltipY, TOOLTIP_SPRING);

        this.ngZone.run(() => {
          this.cursorXSignal.set(this.cursorX.current);
          this.cursorYSignal.set(this.cursorY.current);

          this.tooltipXSignal.set(this.tooltipX.current);
          this.tooltipYSignal.set(this.tooltipY.current);
        });

        this.rafId = requestAnimationFrame(loop);
      };

      loop();
    });
  }

  private updateSpring(s: SpringValue, config: { stiffness: number; damping: number }) {
    const force = -config.stiffness * (s.current - s.target);
    const damping = -config.damping * s.velocity;
    const accel = force + damping;

    s.velocity += accel / 60;
    s.current += s.velocity / 60;
  }

  private updateDimensions(): void {
    const el = this.tooltipElementRef?.nativeElement;
    if (!el) return;

    this.dimensions.set({
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }
}
