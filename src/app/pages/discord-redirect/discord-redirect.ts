import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-discord-redirect',
  imports: [],
  templateUrl: './discord-redirect.html',
  styleUrl: './discord-redirect.scss',
})
export class DiscordRedirect implements OnInit {
  ngOnInit() {
    window.location.href = 'https://discord.gg/';
  }
}
