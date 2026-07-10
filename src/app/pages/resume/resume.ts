import { afterNextRender, Component, inject, OnDestroy } from '@angular/core';
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
export class Resume implements OnDestroy {
  private static readonly NAVBAR_HEIGHT_REM = 3.125;
  private mouseService = inject(MouseService);
  private readonly skillRailTweens: gsap.core.Tween[] = [];
  private readonly onWindowResize = () => {
    this.initSkillRails();
  };

  public projects = [
    { name: 'Debugg.Co', technology: 'Angular', link: 'https://github.com/RealDebugg/debugg.co' },
    {
      name: 'Scrum Poker',
      technology: 'Next.JS, Ably, Prisma ORM',
      link: 'https://github.com/RealDebugg/planning-poker/',
    },
    {
      name: 'Countdowns',
      technology: 'Next.JS, Prisma ORM',
      link: 'https://github.com/RealDebugg/days/',
    },
    {
      name: 'VS Code NPM Menu',
      technology: 'JavaScript',
      link: 'https://github.com/RealDebugg/vsc-nodecmd/',
    },
    {
      name: 'ShareX Provider',
      technology: 'Next.JS, Vercel Blob Storage',
      link: 'https://github.com/RealDebugg/sharex-nextjs-uploader/',
    },
    {
      name: 'RDR3 POIs',
      technology: 'RedM, TypeScript',
      link: 'https://github.com/RealDebugg/rdr3-pois/',
    },
    {
      name: 'VR Game Template',
      technology: 'Unity, C#',
      link: 'https://github.com/RealDebugg/VRGame',
    },
    {
      name: 'Discord Bot',
      technology: 'Discord.JS, Prisma ORM',
      link: 'https://github.com/RealDebugg/debuggs-discord-bot',
    },
    {
      name: 'FiveM Deaddrop',
      technology: 'FiveM, JavaScript',
      link: 'https://github.com/RealDebugg/fivem-deaddrop/',
    },
    {
      name: 'FiveM Snippets',
      technology: 'FiveM, LUA, JavaScript',
      link: 'https://github.com/RealDebugg/debugg-public/',
    },
    {
      name: 'RedM Pointing',
      technology: 'RedM, LUA',
      link: 'https://github.com/Infamous-Development-Studio/rdr2-pointing',
    },
    {
      name: 'RedM Law Anims',
      technology: 'RedM, LUA',
      link: 'https://github.com/Infamous-Development-Studio/rdr2-law-anims',
    },
  ];

  public workplaces = [
    {
      name: 'GCG Sweden AB',
      position: 'Software Developer',
      year: '2024 - Now',
      description: 'Enter a description here',
    },
    {
      name: 'Autocom Diagnostic Partner AB',
      position: 'Software Developer',
      year: '2023 - Now',
      description: 'Enter a description here',
    },
    {
      name: 'Trestads Tolkförmedling AB',
      position: 'Software Developer',
      year: '2023 - 2023',
      description: 'Enter a description here',
    },
  ];

  public skillsRail1 = [
    'Grafana',
    'AWS',
    'CANBUS',
    'C++',
    'Terraform',
    'Agile Development',
    'Scrum',
    'Jira',
    'Confluence',
    'Git',
    'GitHub',
    'GitLab',
    'Docker',
    'Vagrant',
    'Prisma',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'NGINX',
  ];
  public skillsRail2 = [
    'EF Core',
    'LUA',
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue',
    'NuxtJS',
    'Electron',
    'CI/CD',
    'TDD',
    'CRUD',
    'Bruno',
    'iDenfy',
    'C#',
    '.NET',
    'NextJS',
    'ExpressJS',
    'Kotlin',
  ];
  public skillsRail3 = [
    'Axios',
    'Nuxt Auth',
    'Next Auth',
    'GO',
    'SQL',
    'AWS RDS',
    'REST API',
    'WebSocket',
    'Supabase',
    'PHP',
    'Auth0',
    'AWS Aurora',
    'AWS Lambda',
    'LaunchDarkly',
    'Python',
    'NoSQL',
    'Linux',
    'SSH',
    'WPF',
    'GSAP',
  ];

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
      color: '#ffffff',
      ease: 'none',
      stagger: 0.1,
      duration: 0.1,
      scrollTrigger: {
        trigger: '.split-intro',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        pin: true,
      },
    });

    this.initMarquees();
    this.initSkillRails();
    this.initWorkplaceTimeline();
    window.addEventListener('resize', this.onWindowResize);
  }

  private initWorkplaceTimeline(): void {
    const stage = document.querySelector<HTMLElement>('.timeline-stage');
    const marker = document.querySelector<HTMLElement>('.timeline-marker');
    const line = document.querySelector<HTMLElement>('.timeline-line');
    const entries = document.querySelectorAll<HTMLElement>('.timeline-entry');

    if (!stage || !marker || !line || !entries.length) {
      return;
    }

    const numEntries = entries.length;
    marker.style.top = '0';

    ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        const navHeightPx = this.getNavbarHeightPx();
        const visibleViewportCenter = navHeightPx + (window.innerHeight - navHeightPx) / 2;
        const rect = stage.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const markerHalfHeight = marker.offsetHeight / 2;
        const markerTargetY = visibleViewportCenter - sectionTop;

        let markerY;
        if (markerTargetY < markerHalfHeight) {
          markerY = markerHalfHeight;
        } else if (markerTargetY > sectionHeight - markerHalfHeight) {
          markerY = sectionHeight - markerHalfHeight;
        } else {
          markerY = markerTargetY;
        }

        marker.style.top = `${markerY}px`;
      },
      invalidateOnRefresh: true,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: () => `top top+=${this.getNavbarHeightPx()}`,
        end: () => {
          const navHeightPx = this.getNavbarHeightPx();
          const effectiveViewportHeight = Math.max(window.innerHeight - navHeightPx, 1);
          return `+=${numEntries * effectiveViewportHeight}`;
        },
        pin: stage,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(line,
      {
        backgroundPosition: '0% 50%',
        ease: 'none',
      },
      0
    );

    entries.forEach((entry, index) => {
      const card = entry.querySelector<HTMLElement>('.timeline-card');
      if (!card) {
        return;
      }

      const startTime = index / numEntries;
      const duration = 1 / numEntries;

      tl.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: duration * 0.5,
          ease: 'power2.out',
        },
        startTime,
      );

      tl.to(
        card,
        {
          opacity: 0,
          y: -60,
          duration: duration * 0.5,
          ease: 'power2.in',
        },
        startTime + duration * 0.5,
      );

      tl.to(line,
        {
          backgroundPosition: `0% ${(index + 1) * 10}%`,
          ease: 'none',
          duration: duration,
        },
        startTime,
      );
    });
  }

  private initSkillRails(): void {
    const rails = Array.from(document.querySelectorAll<HTMLElement>('.scrolling-text .rail'));
    if (!rails.length) {
      return;
    }

    this.killSkillRailTweens();

    rails.forEach((rail, index) => {
      const loopDistance = this.prepareSkillRail(rail);
      if (loopDistance <= 0) {
        return;
      }

      const moveLeft = index % 2 === 0;
      const duration = Math.max(20, loopDistance / 28);
      const fromX = moveLeft ? 0 : -loopDistance;
      const toX = moveLeft ? -loopDistance : 0;

      const tween = gsap.fromTo(
        rail,
        { x: fromX },
        {
          x: toX,
          duration,
          ease: 'none',
          repeat: -1,
        },
      );

      this.skillRailTweens.push(tween);
    });
  }

  private getNavbarHeightPx(): number {
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize || '16',
    );

    return Resume.NAVBAR_HEIGHT_REM * rootFontSize;
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

    if (
      !this.prepareMarqueeTrack(forwardTrack, true) ||
      !this.prepareMarqueeTrack(reverseTrack, true)
    ) {
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

  private prepareSkillRail(rail: HTMLElement): number {
    const chips = Array.from(rail.children) as HTMLElement[];
    if (!chips.length) {
      return 0;
    }

    const originalCount = Number.parseInt(rail.dataset['originalCount'] ?? '', 10) || chips.length;
    rail.dataset['originalCount'] = String(originalCount);

    const originals = Array.from(rail.children).slice(0, originalCount) as HTMLElement[];
    if (!originals.length) {
      return 0;
    }

    const cycleWidth = originals.reduce((total, chip) => {
      const styles = window.getComputedStyle(chip);
      const marginLeft = Number.parseFloat(styles.marginLeft || '0');
      const marginRight = Number.parseFloat(styles.marginRight || '0');
      return total + chip.getBoundingClientRect().width + marginLeft + marginRight;
    }, 0);

    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) {
      return 0;
    }

    const viewportWidth = rail.parentElement?.clientWidth ?? window.innerWidth;
    const minCopies = Math.max(3, Math.ceil((viewportWidth * 2) / cycleWidth) + 1);
    const requiredChildren = originalCount * minCopies;

    for (let i = rail.children.length; i < requiredChildren; i++) {
      const source = originals[i % originalCount];
      rail.appendChild(source.cloneNode(true));
    }

    return cycleWidth;
  }

  private killSkillRailTweens(): void {
    for (const tween of this.skillRailTweens) {
      tween.kill();
    }

    this.skillRailTweens.length = 0;
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

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.killSkillRailTweens();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
