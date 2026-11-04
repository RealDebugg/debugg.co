import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container-with-dots',
  imports: [],
  templateUrl: './container-with-dots.html',
})
export class ContainerWithDots {
  classNames = input<string>();
  fullWidth = input(false);
}
