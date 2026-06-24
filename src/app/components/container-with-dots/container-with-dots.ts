import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container-with-dots',
  imports: [],
  templateUrl: './container-with-dots.html',
  styleUrl: './container-with-dots.scss',
})
export class ContainerWithDots {
  classNames = input<string>();
}
