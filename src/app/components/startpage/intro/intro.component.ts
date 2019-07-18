import {Component, ViewChild, ElementRef, AfterViewInit, Renderer2} from '@angular/core';

@Component({
  selector: 'core-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements AfterViewInit {
  @ViewChild('background', {read: ElementRef, static: true}) background: ElementRef;
  @ViewChild('logo', {read: ElementRef, static: true}) logo: ElementRef;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.initPralaxEffect();
  }

  private initPralaxEffect() {
    const thresholdArr = (num) => {
      const arr = [];
      const levels = num;
      while (num--) {
        arr[num] = num / levels;
      }
      return arr;
    };

    const options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '64px',
      threshold: thresholdArr(100)
    };
    const entries = [0.01];

    const callback = (entries: IntersectionObserverEntry[], observer) => {
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
