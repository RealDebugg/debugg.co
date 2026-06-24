import { AfterViewInit, Component } from '@angular/core';
import { Lastfm } from '../../components/lastfm/lastfm';
import { RouterLink } from '@angular/router';
import { ContainerWithDots } from '../../components/container-with-dots/container-with-dots';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-home',
  imports: [Lastfm, RouterLink, ContainerWithDots],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit() {
    const offsets = [-80, 80];

    gsap.to('.animated-shot', {
      yPercent: (index) => offsets[index],
      scrollTrigger: {
        trigger: '.anim-trigger',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
        markers: false,
      },
    });
  }
}
