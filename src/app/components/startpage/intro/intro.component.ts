import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'core-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements AfterViewInit {
  @ViewChild('background', {read: ElementRef}) background: ElementRef;
  @ViewChild('logo', {read: ElementRef}) logo: ElementRef;

  rowHeight = "4:1";

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.initPralaxEffect();
  }

  private initPralaxEffect() {   
    const thresholdArr = (num) => {
      const arr = []
      const levels = num
      while (num--) {
        arr[num] = num / levels
      }
      return arr
    }

    const options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '64px',
      threshold: thresholdArr(100)
    }
    const entries = [0.01];

    const callback = (entries: IntersectionObserverEntry[], observer) => {
      let entry = entries[0];
      let positiony = 0;
      console.log(`(${entry.boundingClientRect.height + entry.boundingClientRect.top } < ${entry.rootBounds.height} = ${(entry.boundingClientRect.height + entry.boundingClientRect.top )< entry.rootBounds.height}`);
      if ((entry.boundingClientRect.height + entry.boundingClientRect.top )< entry.rootBounds.height ) { // dont move it down if we are at the top
        let movement = 1 - entry.intersectionRatio;
        positiony = movement * 200;
      }
      this.renderer.setStyle(
        this.background.nativeElement,
        'background-position-y',
        `${positiony}px`
      );
      this.renderer.setStyle(
        this.logo.nativeElement,
        'padding-top',
        `${positiony * 3}px`
      );
      this.renderer.setStyle(
        this.logo.nativeElement,
        'opacity',
        `${1 - (positiony * 0.01)}`
      );
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(this.background.nativeElement);
  }
}
