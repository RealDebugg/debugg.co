import { afterNextRender, Component } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  initGsap() {
    gsap.registerPlugin(SplitText, ScrollTrigger);
    gsap.set('.split', { opacity: 1 });

    SplitText.create('.split', {
      type: 'lines',
      autoSplit: true,
      mask: 'lines',
      onSplit: (self) => {
        gsap.from(self.lines, {
          duration: 1.0,
          yPercent: 100,
          opacity: 0,
          stagger: 0.1,
          ease: 'expo.out',
        });
      },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.intro-wrapper',
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        pin: true,
      },
    });

    // Text 1 & 3 start shifted left and scroll BACK to their normal position (0)
    tl.from(['.intro-text1', '.intro-text3'], { right: '100%', duration: 1 })

      // Text 2 starts normal (0) and scrolls FORWARD to the right
      .to('.intro-text2', { xPercent: -100, duration: 1 });

    /* gsap.to('.intro-text1', {
      xPercent: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro-wrapper',
        pin: true,
        end: '+=5000px',
        scrub: true,
      },
    });

    gsap.to('.intro-text2', {
      xPercent: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro-wrapper',
        pin: true,
        end: '+=5000px',
        scrub: true,
      },
    });

    gsap.to('.intro-text3', {
      xPercent: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro-wrapper',
        pin: true,
        end: '+=5000px',
        scrub: true,
      },
    }); */
  }

  constructor() {
    afterNextRender(() => {
      this.initGsap();
    });
  }
}
