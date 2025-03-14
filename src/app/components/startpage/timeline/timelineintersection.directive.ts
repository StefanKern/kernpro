import {Directive, ElementRef, Inject, Input, PLATFORM_ID, Renderer2} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Directive({
    selector: '[coreTimelineintersection]',
    standalone: false
})
export class TimelineintersectionDirective {

  @Input() coreTimelineintersection: string;

  constructor(el: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    renderer.addClass(el.nativeElement, 'animate__animated');
    this.renderer.setStyle(
      el.nativeElement,
      'visibility',
      'hidden'
    );

    const options = {
      // root: /* needs to be the element, where the scrollbar is on. Because it is on the <html> element we dont need to set it */,
      rootMargin: '0px',
      threshold: 1.0
    };
    const callback = (entries) => {
      entries.forEach(entry => {
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
