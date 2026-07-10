import { Component, afterNextRender } from '@angular/core';
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
export class Home {
  public yearsSinceFirstJob = new Date().getFullYear() - 2023;

  initGsap() {
    gsap.registerPlugin(ScrollTrigger);
    const offsets = [-80, 80];

    gsap.to('.animated-shot', {
      yPercent: (index) => offsets[index],
      scrollTrigger: {
        trigger: '.anim-trigger',
        start: 'top 100%',
        end: 'bottom 0%',
        scrub: 0.8,
        markers: false,
      },
    });
  }

  constructor() {
    afterNextRender(() => {
      this.initGsap();
    });
  }
}
