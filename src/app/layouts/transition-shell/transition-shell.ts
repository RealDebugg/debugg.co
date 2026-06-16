import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, inject, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
selector: 'app-transition-shell',
templateUrl: './transition-shell.html',
styleUrls: ['./transition-shell.scss']
})
export class TransitionShell implements OnChanges {
  @Input() flip = false;
  @Input() disabled = false;
  previousHtml: SafeHtml | '' = '';
  private previousHtmlRaw = '';

  @HostBinding('attr.data-flip') dataFlip: 'true' | 'false' = 'false';
  @HostBinding('attr.data-disabled') dataDisabled: 'true' | 'false' = 'false';
  @HostBinding('attr.data-has-previous') dataHasPrevious: 'true' | 'false' = 'false';

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flip']) {
      this.setHostAttr('data-flip', this.flip ? 'true' : 'false');
    }
    if (changes['disabled']) {
      this.setHostAttr('data-disabled', this.disabled ? 'true' : 'false');
    }
  }

  capturePreviousFrame() {
    const liveLayer = this.hostEl.nativeElement.querySelector(
      '.live-layer'
    ) as HTMLElement | null;

    if (!liveLayer) return;

    this.previousHtmlRaw = liveLayer.innerHTML;
    this.previousHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.previousHtmlRaw
    );
    this.setHostAttr('data-has-previous', 'true');
  }

  clearPreviousFrame() {
    this.previousHtmlRaw = '';
    this.previousHtml = '';
    this.setHostAttr('data-has-previous', 'false');
  }

  private setHostAttr(name: string, value: string) {
    this.hostEl.nativeElement.setAttribute(name, value);
    if (name === 'data-flip') {
      this.dataFlip = value as 'true' | 'false';
    } else if (name === 'data-disabled') {
      this.dataDisabled = value as 'true' | 'false';
    } else if (name === 'data-has-previous') {
      this.dataHasPrevious = value as 'true' | 'false';
    }
    this.cdr.detectChanges();
  }
}
