import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeonService } from '../../services/neon.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly neonService = inject(NeonService);

  playHoverAudio(): void {
    this.neonService.playHover();
  }

  stopHoverAudio(): void {
    this.neonService.stopHover();
  }

}
