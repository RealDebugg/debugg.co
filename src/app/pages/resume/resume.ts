import { afterNextRender, Component, inject } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MouseService } from '../../services/mouse.service';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  private mouseService = inject(MouseService);

  public projects = [
    {name: "Debugg.Co", technology: "Angular", link: "https://github.com/RealDebugg/debugg.co"},
    {name: "Scrum Poker", technology: "Next.JS, Ably, Prisma ORM", link: "https://github.com/RealDebugg/planning-poker/"},
    {name: "Countdowns", technology: "Next.JS, Prisma ORM", link: "https://github.com/RealDebugg/days/"},
    {name: "VS Code NPM Menu", technology: "JavaScript", link: "https://github.com/RealDebugg/vsc-nodecmd/"},
    {name: "ShareX Provider", technology: "Next.JS, Vercel Blob Storage", link: "https://github.com/RealDebugg/sharex-nextjs-uploader/"},
    {name: "RDR3 POIs", technology: "RedM, TypeScript", link: "https://github.com/RealDebugg/rdr3-pois/"},
    {name: "VR Game Template", technology: "Unity, C#", link: "https://github.com/RealDebugg/VRGame"},
    {name: "Discord Bot", technology: "Discord.JS, Prisma ORM", link: "https://github.com/RealDebugg/debuggs-discord-bot"},
    {name: "FiveM Deaddrop", technology: "FiveM, JavaScript", link: "https://github.com/RealDebugg/fivem-deaddrop/"},
    {name: "FiveM Snippets", technology: "FiveM, LUA, JavaScript", link: "https://github.com/RealDebugg/debugg-public/"},
    {name: "RedM Pointing", technology: "RedM, LUA", link: "https://github.com/Infamous-Development-Studio/rdr2-pointing"},
    {name: "RedM Law Anims", technology: "RedM, LUA", link: "https://github.com/Infamous-Development-Studio/rdr2-law-anims"}

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

    this.initMarquees();
  }

  private initMarquees(): void {
    const travelFactor = 0.05;
    const scrubSmoothing = 0.7;

    const marqueeWrap = document.querySelector<HTMLElement>('.resume-marquee-wrap');
    const forwardTrack = document.querySelector<HTMLElement>('.m-anim-forw');
    const reverseTrack = document.querySelector<HTMLElement>('.m-anim-rev');

    if (!marqueeWrap || !forwardTrack || !reverseTrack) {
      return;
    }

    this.prepareMarqueeTrack(forwardTrack);
    this.prepareMarqueeTrack(reverseTrack);

    if (!this.prepareMarqueeTrack(forwardTrack, true) || !this.prepareMarqueeTrack(reverseTrack, true)) {
      return;
    }

    gsap.fromTo(
      forwardTrack,
      { x: 0 },
      {
        x: () => -(this.prepareMarqueeTrack(forwardTrack, true) * travelFactor),
        ease: 'none',
        scrollTrigger: {
          trigger: marqueeWrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: scrubSmoothing,
          invalidateOnRefresh: true,
        },
      },
    );

    gsap.fromTo(
      reverseTrack,
      { x: () => -(this.prepareMarqueeTrack(reverseTrack, true) * travelFactor) },
      {
        x: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: marqueeWrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: scrubSmoothing,
          invalidateOnRefresh: true,
        },
      },
    );
  }

  private prepareMarqueeTrack(track: HTMLElement, skipClone = false): number {
    const children = Array.from(track.children) as HTMLElement[];
    if (!children.length) {
      return 0;
    }

    if (!skipClone && !track.dataset['marqueeReady']) {
      for (const child of children) {
        track.appendChild(child.cloneNode(true));
      }

      track.dataset['marqueeReady'] = 'true';
    }

    const loopDistance = track.scrollWidth / 2;
    if (!Number.isFinite(loopDistance) || loopDistance <= 0) {
      return 0;
    }

    return loopDistance;
  }

  onHoverEnter(text: string): void {
    this.mouseService.setHoverText(text);
  }

  onHoverLeave(): void {
    this.mouseService.resetCursor();
  }

  constructor() {
    afterNextRender(() => {
      this.initGsap();
    });
  }
}
