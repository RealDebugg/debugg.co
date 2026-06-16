import { Component, ElementRef, HostBinding, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
selector: 'app-transition-shell',
templateUrl: './transition-shell.html',
styleUrls: ['./transition-shell.scss']
})
export class TransitionShell {
  @Input() flip = false;
  @Input() disabled = false;
  previousHtml: SafeHtml | '' = '';
  private previousHtmlRaw = '';

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly sanitizer = inject(DomSanitizer);

  @HostBinding('attr.data-flip')
  get dataFlip(): 'true' | 'false' {
    return this.flip ? 'true' : 'false';
  }

  @HostBinding('attr.data-disabled')
  get dataDisabled(): 'true' | 'false' {
    return this.disabled ? 'true' : 'false';
  }

  @HostBinding('attr.data-has-previous')
  get dataHasPrevious(): 'true' | 'false' {
    return this.previousHtmlRaw ? 'true' : 'false';
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
  }

  clearPreviousFrame() {
    this.previousHtmlRaw = '';
    this.previousHtml = '';
  }
}
