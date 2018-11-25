import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'core-timeline',
  templateUrl: './timeline.component.html'
})
export class TimelineComponent implements OnInit, AfterViewInit {
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    let options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '0px',
      threshold: 1.0
    }
    let entries = [0, 0.25, 0.5, 0.75, 1.0];
    let callback = function(entries, observer) { 
      entries.forEach(entry => {
        debugger;
        // Each entry describes an intersection change for one observed
        // target element:
        //   entry.boundingClientRect
        //   entry.intersectionRatio
        //   entry.intersectionRect
        //   entry.isIntersecting
        //   entry.rootBounds
        //   entry.target
        //   entry.time
      });
    };
    
    var observer = new IntersectionObserver(callback, options);

    let test = document.querySelector('#test');
    observer.observe(test);
  }

}
