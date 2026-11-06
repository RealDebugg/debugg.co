import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, afterNextRender, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lastfm } from '../../components/lastfm/lastfm';
import { ContainerWithDots } from '../../components/container-with-dots/container-with-dots';
import { Button } from '../../components/button/button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { catchError, map, of, startWith } from 'rxjs';

interface LatestPost {
  id: number;
  date: string;
  title: string;
  description: string;
}

interface PostsResponse {
  data: LatestPost[];
}

type LatestPostState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error' }
  | { status: 'loaded'; post: LatestPost };

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, DatePipe, Lastfm, RouterLink, ContainerWithDots, Button],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnDestroy {
  private readonly http = inject(HttpClient);
  private animationContext?: gsap.Context;

  readonly latestPost = this.http.get<PostsResponse>('/api/public/posts').pipe(
    map(({ data }): LatestPostState => {
      const post = data
        .filter((candidate) => Date.parse(candidate.date) <= Date.now())
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
      return post ? { status: 'loaded', post } : { status: 'empty' };
    }),
    startWith<LatestPostState>({ status: 'loading' }),
    catchError(() => of<LatestPostState>({ status: 'error' })),
  );

  postTitleFontSize(title: string): string {
    const length = title.length;
    if (length > 48) {
      return 'clamp(1.15rem, 2vw, 1.5rem)';
    }
    if (length > 32) {
      return 'clamp(1.35rem, 2.6vw, 1.9rem)';
    }
    return 'clamp(1.5rem, 3.2vw, 2.5rem)';
  }

  initGsap() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const hero = document.querySelector('.home-hero');
    if (!hero) {
      return;
    }

    this.animationContext = gsap.context(() => {
      gsap.to('.hero-image', {
        yPercent: -6,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.home-hero',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, hero);
  }

  scrollToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    window.history.replaceState(null, '', `#${sectionId}`);
    gsap.to(window, {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
      ease: 'power2.inOut',
      scrollTo: {
        y: target,
        offsetY: 50,
        autoKill: true,
      },
    });
  }

  constructor() {
    afterNextRender(() => {
      this.initGsap();
    });
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
