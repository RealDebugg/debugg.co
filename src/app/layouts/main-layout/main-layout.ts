import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Controls } from '../../components/controls/controls';
import { Navlinks } from "../../components/navlinks/navlinks";
import { Footer } from "../../components/footer/footer";
import { DiscordStatus } from "../../components/discord-status/discord-status";
import { Lastfm } from "../../components/lastfm/lastfm";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Controls, Navlinks, Footer, DiscordStatus, Lastfm],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
