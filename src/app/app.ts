import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HumanComponent } from 'human-angular-lib';
import { HonkService } from './services/honk.service';
import { PhosphorTrailService } from './services/phosphor-trail.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { TransitionShell } from "./layouts/transition-shell/transition-shell";
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HumanComponent, TransitionShell, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('debugg.co');
  honkService = inject(HonkService);
  phosphorTrailService = inject(PhosphorTrailService);

  flip = false;
  disabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private destroy$ = new Subject<void>();
  private readonly transitionMs = 750; // keep aligned with --mask-speed: 0.75
  private hasCompletedInitialNavigation = false;
  private transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  @ViewChild(TransitionShell) transitionShell?: TransitionShell;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (this.disabled) return;

        if (event instanceof NavigationStart) {
          if (!this.hasCompletedInitialNavigation) {
            return;
          }

          this.transitionShell?.capturePreviousFrame();
          this.flip = true;
          this.cdr.detectChanges();

          if (this.transitionTimeoutId) {
            clearTimeout(this.transitionTimeoutId);
            this.transitionTimeoutId = null;
          }

          return;
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          if (!this.hasCompletedInitialNavigation) {
            this.hasCompletedInitialNavigation = true;
            return;
          }

          if (this.transitionTimeoutId) {
            clearTimeout(this.transitionTimeoutId);
          }

          this.transitionTimeoutId = setTimeout(() => {
            this.flip = false;
            this.transitionShell?.clearPreviousFrame();
            // Needed in zoneless mode so the host binding reflects the new value.
            this.cdr.detectChanges();
          }, this.transitionMs);

          return;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
