import { Component, OnInit } from '@angular/core';
import { OpenMeteoService } from '../../services/openmeteo.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  currentYear: number = new Date().getFullYear();
  swedishTime: string = new Date().toLocaleTimeString('en-US', {
    timeZone: 'Europe/Stockholm',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  constructor(public openMeteo: OpenMeteoService) {}

  ngOnInit(): void {
    this.openMeteo.fetch();
  }
}
