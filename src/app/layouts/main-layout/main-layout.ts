import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Controls } from '../../components/sidebar/controls/controls';
import { Navlinks } from "../../components/sidebar/navlinks/navlinks";
import { Footer } from "../../components/footer/footer";
import { DiscordStatus } from "../../components/sidebar/discord-status/discord-status";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Controls, Navlinks, Footer, DiscordStatus],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
