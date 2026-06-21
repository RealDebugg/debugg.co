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
} from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MouseService } from '../../services/mouse.service';
import { MarqueeComponent } from './marquee.component';

const OFFSET = 20;
const DEBOUNCE_WAIT = 5;
const SPRING_CONFIG = { damping: 50, stiffness: 500 };

interface SpringValue {
  current: number;
  target: number;
  velocity: number;
}

@Component({
  selector: 'app-custom-tooltip',
  standalone: true,
  imports: [CommonModule, MarqueeComponent],
  templateUrl: './custom-tooltip.component.html',
  styleUrl: './custom-tooltip.component.scss',
  animations: [
    trigger('fadeInScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('0.2s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0, transform: 'scale(0)' })),
      ]),
    ]),
  ],
})
export class CustomTooltipComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mouseElement') mouseElementRef?: ElementRef<HTMLDivElement>;

  protected mouseService = inject(MouseService);
  private ngZone = inject(NgZone);
  protected dimensions = signal({ width: 0, height: 0 });
  protected animatedX = signal(0);
  protected animatedY = signal(0);

  protected showMarquee = computed(() => this.mouseService.marquee());
  protected hoverTextValue = computed(() => this.mouseService.hoverText());

  private springX: SpringValue = { current: 0, target: 0, velocity: 0 };
  private springY: SpringValue = { current: 0, target: 0, velocity: 0 };
  private mouseEventListener?: (e: MouseEvent) => void;
  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;
  private debounceTimeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    this.setupSpringAnimation();
  }

  ngOnInit(): void {
    this.setupResizeObserver();
    this.setupMouseListener();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();
  }

  ngOnDestroy(): void {
    this.cleanup();
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

  private debounceUpdateMousePosition(e: MouseEvent): void {
    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
    }

    this.debounceTimeoutId = setTimeout(() => {
      this.updateMousePosition(e);
    }, DEBOUNCE_WAIT);
  }

  private updateMousePosition(e: MouseEvent): void {
    const { width, height } = this.dimensions();

    const desiredX = e.clientX + OFFSET;
    const desiredY = e.clientY + OFFSET * 2;

    const defaultX = e.clientX - OFFSET - width;
    const defaultY = e.clientY - OFFSET - height;

    const xPos = desiredX + width > window.innerWidth ? defaultX : desiredX;

    const isOutsideCanvas = window.scrollY > window.innerHeight;

    const yPos = isOutsideCanvas
      ? desiredY + height > window.innerHeight
        ? defaultY
        : desiredY
      : desiredY + height > window.innerHeight - window.scrollY
        ? defaultY
        : desiredY;

    this.springX.target = xPos;
    this.springY.target = yPos;
  }

  private cleanup(): void {
    if (this.mouseEventListener) {
      this.ngZone.runOutsideAngular(() => {
        window.removeEventListener('mousemove', this.mouseEventListener!);
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
