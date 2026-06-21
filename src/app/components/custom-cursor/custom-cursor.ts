import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

interface SpringValue {
  current: number;
  target: number;
  velocity: number;
}

const DEBOUNCE_WAIT = 5;
const SPRING_CONFIG = { damping: 50, stiffness: 500 };

/* TODO: Detect if text is hovered or link is hovered */

@Component({
  selector: 'app-custom-cursor',
  imports: [],
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CustomCursor implements OnInit, AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);
  private animationFrameId?: number;
  protected dimensions = signal({ width: 0, height: 0 });
  private mouseEventListener?: (e: MouseEvent) => void;
  private debounceTimeoutId?: ReturnType<typeof setTimeout>;
  private resizeObserver?: ResizeObserver;
  private cursorOverListener?: (e: MouseEvent) => void;
  private cursorOutListener?: (e: MouseEvent) => void;
  @ViewChild('mouseElement') mouseElementRef?: ElementRef<HTMLDivElement>;
  @ViewChild('outerCursor') outerCursorRef?: ElementRef<HTMLDivElement>;
  @ViewChild('innerCursor') innerCursorRef?: ElementRef<HTMLDivElement>;

  protected animatedX = signal(0);
  protected animatedY = signal(0);
  private springX: SpringValue = { current: 0, target: 0, velocity: 0 };
  private springY: SpringValue = { current: 0, target: 0, velocity: 0 };

  constructor() {
    this.setupSpringAnimation();
  }

  ngOnInit(): void {
    this.setupResizeObserver();
    this.setupMouseListener();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();
    this.setupCursorModeListeners();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupResizeObserver(): void {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
    });

    if (this.mouseElementRef?.nativeElement) {
      this.resizeObserver.observe(this.mouseElementRef.nativeElement);
      this.updateDimensions();
    }
  }

  private updateDimensions(): void {
    if (!this.mouseElementRef?.nativeElement) return;

    const element = this.mouseElementRef.nativeElement;
    this.dimensions.set({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }

  private setupMouseListener(): void {
    if (typeof window === 'undefined') return;

    this.mouseEventListener = (e: MouseEvent) => {
      this.debounceUpdateMousePosition(e);
    };

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.mouseEventListener!, {
        passive: true,
      });
    });
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
        this.mouseElementRef?.nativeElement?.contains(relatedTarget)
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

  private debounceUpdateMousePosition(e: MouseEvent): void {
    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
    }

    this.debounceTimeoutId = setTimeout(() => {
      this.updateMousePosition(e);
    }, DEBOUNCE_WAIT);
  }

  private updateMousePosition(e: MouseEvent): void {
    this.springX.target = e.clientX;
    this.springY.target = e.clientY;
  }

  private setupSpringAnimation(): void {
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.updateSpring(this.springX);
        this.updateSpring(this.springY);

        // Update signals only within Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.animatedX.set(Math.round(this.springX.current));
          this.animatedY.set(Math.round(this.springY.current));
        });

        this.animationFrameId = requestAnimationFrame(animate);
      };
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  private updateSpring(spring: SpringValue): void {
    const k = SPRING_CONFIG.stiffness;
    const d = SPRING_CONFIG.damping;
    const m = 1;

    // Spring force: F = -kx
    const springForce = -k * (spring.current - spring.target);
    // Damping force: F = -dv
    const dampingForce = -d * spring.velocity;
    // Total acceleration
    const acceleration = (springForce + dampingForce) / m;

    spring.velocity += acceleration * (1 / 60); // Assuming 60fps
    spring.current += spring.velocity * (1 / 60);
  }

  private cleanup(): void {
    if (this.mouseEventListener) {
      this.ngZone.runOutsideAngular(() => {
        window.removeEventListener('mousemove', this.mouseEventListener!);
      });
    }

    if (this.cursorOverListener) {
      this.ngZone.runOutsideAngular(() => {
        document.removeEventListener('mouseover', this.cursorOverListener!);
      });
    }

    if (this.cursorOutListener) {
      this.ngZone.runOutsideAngular(() => {
        document.removeEventListener('mouseout', this.cursorOutListener!);
      });
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
    }
  }
}
