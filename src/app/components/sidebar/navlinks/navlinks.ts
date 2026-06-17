import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navlinks',
  imports: [RouterLink],
  templateUrl: './navlinks.html',
  styleUrl: './navlinks.scss',
})
export class Navlinks implements AfterViewInit, OnDestroy {
  @ViewChildren('navlink', { read: ElementRef }) navlinks!: QueryList<ElementRef>;
  
  private blinkInterval: any;

  ngAfterViewInit() {
    this.startBlinking();
  }

  ngOnDestroy() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
  }

  private startBlinking() {
    this.blinkInterval = setInterval(() => {
      const navlinkElements = this.navlinks.toArray();
      if (navlinkElements.length === 0) return;
      
      const random = Math.floor(Math.random() * navlinkElements.length);
      const element = navlinkElements[random].nativeElement;
      
      element.style.color = '#00f3ff';
      
      setTimeout(() => {
        element.style.color = 'white';
      }, 500);
    }, 2000);
  }
}
