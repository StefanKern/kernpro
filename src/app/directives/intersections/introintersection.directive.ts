import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { ConstantPool } from '@angular/compiler';

@Directive({
  selector: '[coreIntrointersection]'
})
export class IntrointersectionDirective {

  constructor(el: ElementRef, private renderer: Renderer2) {

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

    let callback = (entries: IntersectionObserverEntry[], observer) => {
      let entry = entries[0];
      let positiony = 0;
      console.log(`(${entry.boundingClientRect.height + entry.boundingClientRect.top } < ${entry.rootBounds.height} = ${(entry.boundingClientRect.height + entry.boundingClientRect.top )< entry.rootBounds.height}`);
      if ((entry.boundingClientRect.height + entry.boundingClientRect.top )< entry.rootBounds.height ) { // dont move it down if we are at the top
        let movement = 1 - entry.intersectionRatio;
        positiony = movement * 200;
      }
      this.renderer.setStyle(
        el.nativeElement,
        'background-position-y',
        `${positiony}px`
      );
    };

    var observer = new IntersectionObserver(callback, options);
    observer.observe(el.nativeElement);
  }

}
