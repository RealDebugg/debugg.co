import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Controls } from '../../components/controls/controls';
import { Navlinks } from "../../components/navlinks/navlinks";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Controls, Navlinks, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
