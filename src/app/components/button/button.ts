import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

type ButtonVariant = 'primary' | 'secondary' | 'text';

@Component({
  selector: 'app-button',
  imports: [RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly route = input<string>();
  readonly href = input<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly activated = output<MouseEvent>();
}
