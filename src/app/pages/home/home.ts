import { Component } from '@angular/core';
import { Lastfm } from '../../components/lastfm/lastfm';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Lastfm, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
