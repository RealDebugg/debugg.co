import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NeonService } from '../../services/neon.service';
import { Controls } from "../controls/controls";

interface NavLink {
  route: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Controls],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnDestroy {
  private readonly neonService = inject(NeonService);
  private readonly document = inject(DOCUMENT);
  private previousBodyOverflow = '';
  private menuButtonTimer: ReturnType<typeof setTimeout> | undefined;

  menuOpen = false;
  readonly menuButtonState = signal<'menu-label' | 'menu-icon' | 'close-label' | 'close-icon'>(
    'menu-icon',
  );
  readonly currentYear = new Date().getFullYear();

  navLinks: NavLink[] = [
    { route: '/blog', label: 'Blog' },
    { route: '/activity', label: 'Activity' },
    { route: '/about', label: 'About me' },
    { route: '/links', label: 'Resources' },
  ];

  playHoverAudio(): void {
    this.neonService.playHover();
  }

  stopHoverAudio(): void {
    this.neonService.stopHover();
  }

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }

    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.menuOpen = true;
    this.showMenuButtonLabel('close-label', 'close-icon');
  }

  closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }

    this.menuOpen = false;
    this.document.body.style.overflow = this.previousBodyOverflow;
    this.showMenuButtonLabel('menu-label', 'menu-icon');
  }

  private showMenuButtonLabel(
    labelState: 'menu-label' | 'close-label',
    iconState: 'menu-icon' | 'close-icon',
  ): void {
    if (this.menuButtonTimer) {
      clearTimeout(this.menuButtonTimer);
    }

    this.menuButtonState.set(labelState);
    this.menuButtonTimer = setTimeout(() => {
      this.menuButtonState.set(iconState);
      this.menuButtonTimer = undefined;
    }, 1000);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  ngOnDestroy(): void {
    this.closeMenu();
    if (this.menuButtonTimer) {
      clearTimeout(this.menuButtonTimer);
    }
  }
}
