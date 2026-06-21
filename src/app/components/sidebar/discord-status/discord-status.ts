import { Component } from '@angular/core';

@Component({
  selector: 'app-discord-status',
  imports: [],
  templateUrl: './discord-status.html',
  styleUrl: './discord-status.scss',
})
export class DiscordStatus {
  online: boolean = true; // Placeholder for actual status, should be updated with real API call
}
