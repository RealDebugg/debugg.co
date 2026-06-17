import { Component } from '@angular/core';
import { Lastfm } from '../../components/lastfm/lastfm';

@Component({
  selector: 'app-home',
  imports: [Lastfm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
