import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';

@Component({
    selector: 'core-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements AfterViewInit {
  @ViewChild('background', {read: ElementRef, static: true}) background: ElementRef;
  @ViewChild('logo', {read: ElementRef, static: true}) logo: ElementRef;

  constructor(private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: object) {
  }

  ngAfterViewInit(): void {
    this.initPralaxEffect();
  }

  private initPralaxEffect() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const thresholdArr = (num) => {
      const arr = [];
      const levels = num;
      while (num--) {
        arr[num] = num / levels;
      }
      return arr;
    };

    const options = {
      // root: /* needs to be the element, where the scrollbar is on. Because it is on the <html> element we dont need to set it */,
      rootMargin: '64px',
      threshold: thresholdArr(100)
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      let positionY = 0;
      // dont move it down if we are at the top
      if ((entry.boundingClientRect.height + entry.boundingClientRect.top) < entry.rootBounds.height) {
        const movement = 1 - entry.intersectionRatio;
        positionY = movement * 200;
      }
      this.renderer.setStyle(
        this.background.nativeElement,
        'background-position-y',
        `${positionY}px`
      );
      this.renderer.setStyle(
        this.logo.nativeElement,
        'padding-top',
        `${positionY * 3}px`
      );
      this.renderer.setStyle(
        this.logo.nativeElement,
        'opacity',
        `${1 - (positionY * 0.01)}`
      );
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(this.background.nativeElement);
  }
}
