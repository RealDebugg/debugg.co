import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeonService } from '../../services/neon.service';
import { Controls } from "../controls/controls";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Controls],
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
