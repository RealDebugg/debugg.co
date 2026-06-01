import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Controls } from '../../components/controls/controls';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Controls],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
