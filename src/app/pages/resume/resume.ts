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
  projects = [
    {name: "Debugg.Co", technology: "Angular", link: "https://github.com/RealDebugg/debugg.co"},
  ]

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

    let textElement = document.getElementById('split-intro');
    const rawText = textElement?.innerText.trim();
    const words = rawText?.split(/\s+/) || [];

    if (textElement) {
      textElement.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(' ');
    }

    const wordElements = document.querySelectorAll('.word');

   gsap.to(wordElements, {
    color: "#ffffff",
    ease: "none",
    stagger: 0.1,
    duration: 0.1,
    scrollTrigger: {
      trigger: ".split-intro",
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
      pin: true,
    }
   })
  }

  constructor() {
    afterNextRender(() => {
      this.initGsap();
    });
  }
}
