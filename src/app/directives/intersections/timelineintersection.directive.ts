import {Directive, ElementRef, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[coreTimelineintersection]'
})
export class TimelineintersectionDirective {

  @Input() coreTimelineintersection: string;

  constructor(el: ElementRef, private renderer: Renderer2) {
    renderer.addClass(el.nativeElement, 'animated');
    this.renderer.setStyle(
      el.nativeElement,
      'visibility',
      'hidden'
    );

    const options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '0px',
      threshold: 1.0
    };
    const entries = [0.01];
    const callback = (entries, observer) => {
      entries.forEach(entry => {
        console.log('role in');
        if (entry.intersectionRatio > 0) {
          this.renderer.removeStyle(
            el.nativeElement,
            'visibility'
          );
          renderer.addClass(el.nativeElement, this.coreTimelineintersection);
          observer.unobserve(el.nativeElement);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(el.nativeElement);
  }
}
