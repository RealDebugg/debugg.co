import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
