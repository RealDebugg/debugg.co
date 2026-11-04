import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dot-matrix-loader',
  standalone: true,
  templateUrl: './dot-matrix-loader.html',
  styleUrl: './dot-matrix-loader.scss',
})
export class DotMatrixLoader {
  readonly size = input(108);
  readonly dotSize = input(16);
  readonly speed = input(1.1);
  readonly color = input('#f4f4f5');
  readonly animated = input(true);
  readonly opacityBase = input(0.12);
  readonly opacityMid = input(0.42);
  readonly opacityPeak = input(1);
  readonly label = input('Loading');

  readonly dots = Array.from({ length: 25 }, (_, index) => index);

  get gap(): number {
    return Math.max(0, (this.size() - this.dotSize() * 5) / 4);
  }

  get speedScale(): number {
    return 1 / Math.max(0.1, this.speed());
  }

  get cycleDuration(): string {
    return `${1.5 * this.speedScale}s`;
  }

  dotDelay(index: number): number {
    const row = Math.floor(index / 5);
    const column = index % 5;
    const path = (4 + row - column) / 8;
    const diagonalParity = (row + column) % 2;

    return (path * 0.2 + diagonalParity * 0.5) * 1500 * this.speedScale;
  }
}
