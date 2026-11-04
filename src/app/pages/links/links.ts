import { afterNextRender, Component, ElementRef, inject, OnDestroy, signal } from '@angular/core';
import { gsap } from 'gsap';
import { MouseService } from '../../services/mouse.service';

@Component({
  selector: 'app-links',
  imports: [],
  templateUrl: './links.html',
  styleUrl: './links.scss',
})
export class Links implements OnDestroy {
  private readonly mouseService = inject(MouseService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private animationContext?: gsap.Context;
  readonly activeCategory = signal('All');

  public links = [
    { name: 'Elias Detlefsen', technology: 'Friend', link: 'https://eliasdetlefsen.se/', tooltip: "Visit Elias" },
    { name: 'My Trello', technology: 'Documentation', link: 'https://trello.com/b/x5JgYTzD/volvo-install-backlog-parts-backlog', tooltip: "Previous retrofits and documentation" },
    { name: 'DiCE and more', technology: 'Documentation', link: 'https://www.volvotechinfo.com/vida#diagnostic-tools', tooltip: "Volvo tools part numbers" },
    { name: 'SVDNS (EU & UK)', technology: 'Documentation', link: 'https://svdns.info/links-downloads/', tooltip: "Unofficial Volvo tools and documentation" },
    { name: 'Diag Laptops (US)', technology: 'Documentation', link: 'https://diaglaptops.com/wp/', tooltip: "US version of SVDNS" },
    { name: 'EWD Install Guide', technology: 'Documentation', link: 'https://svdns.info/2024/12/29/ewd-some-models-show-blank-pages-install-guide/', tooltip: "Installing EWD locally" },
    { name: 'Mongoose + Drivers (EU & UK)', technology: 'Shop', link: 'https://svdns.info/sales-page/', tooltip: "Buy a mongoose" },
    { name: 'VIDA (US)', technology: 'Software', link: 'https://www.volvotechinfo.com/vida#purchasing-a-vida-subscription', tooltip: "Purchase official VIDA" },
    { name: 'VDASH', technology: 'Software', link: 'https://d5t5.com/sw/vdash.exe', tooltip: "Download VDASH" },
    { name: 'P3Tool', technology: 'Software', link: 'https://p3tool.org', tooltip: "Get P3Tool" },
    { name: 'DiCE Drivers', technology: 'Software', link: 'https://d5t5.com/sw/SetupDiCE.exe', tooltip: "Download DiCE drivers" },
    { name: 'VIDA 2014D + EWD + EWD Online', technology: 'Software', link: 'https://volvodiag.com/', tooltip: "Full cracked Volvo software stack" },
    { name: 'Vehicle Spy', technology: 'Software', link: 'https://intrepidcs.com/products/software/vehicle-spy/', tooltip: "Get Vehicle Spy" },


  ];

  get categories(): string[] {
    return ['All', ...new Set(this.links.map((link) => link.technology))];
  }

  get filteredLinks() {
    const category = this.activeCategory();
    return category === 'All' ? this.links : this.links.filter((link) => link.technology === category);
  }

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.animationContext = gsap.context(() => {
        const timeline = gsap.timeline();

        timeline
          .from('.links-title', {
            y: 36,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          })
          .from(
            '.links-intro',
            {
              y: 18,
              opacity: 0,
              duration: 0.55,
              ease: 'power2.out',
            },
            '-=0.45',
          )
          .from(
            '.links-categories',
            {
              opacity: 0,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.25',
          )
          .from(
            '.link-row',
            {
              y: 22,
              opacity: 0,
              duration: 0.5,
              stagger: 0.07,
              ease: 'power3.out',
            },
            '-=0.15',
          );
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }

  selectCategory(category: string): void {
    this.activeCategory.set(category);
  }

  onHoverEnter(text: string): void {
    this.mouseService.setHoverText(text);
  }

  onHoverLeave(): void {
    this.mouseService.resetCursor();
  }
}
