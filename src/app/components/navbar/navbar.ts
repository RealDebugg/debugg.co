import { Component, inject } from '@angular/core';
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
export class Navbar {
  private readonly neonService = inject(NeonService);

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

}
