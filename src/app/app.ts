import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HumanComponent } from 'human-angular-lib';
import { HonkService } from './services/honk.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HumanComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('debugg.co');

  honkService = inject(HonkService);
}
