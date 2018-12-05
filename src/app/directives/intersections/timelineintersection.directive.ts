import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[coreTimelineintersection]'
})
export class TimelineintersectionDirective {

  @Input() coreTimelineintersection: string;

  constructor(el: ElementRef, private renderer: Renderer2) {    
    renderer.addClass(el.nativeElement, "animated");
    this.renderer.setStyle(
      el.nativeElement,
      'visibility',
      'hidden'
    );

    let options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '0px',
      threshold: 1.0
    }
    let entries = [0.01];
    let callback = (entries, observer) => {
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

    var observer = new IntersectionObserver(callback, options);
    observer.observe(el.nativeElement);
  }
}
