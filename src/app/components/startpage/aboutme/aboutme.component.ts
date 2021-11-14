import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {DateTime} from 'luxon';

@Component({
  selector: 'core-aboutme',
  templateUrl: './aboutme.component.html',
  styleUrls: ['./aboutme.component.scss']
})
export class AboutmeComponent implements OnInit {
  age = Math.floor(DateTime.fromFormat('03.10.1986', 'dd.MM.yyyy').diffNow().as('years') * -1);
  scoreOnceVisible = false;
  @ViewChild('score', {read: ElementRef, static: true}) score: ElementRef;

  constructor() { }

  ngOnInit() {
    const options = {
      // root: /* needs to be the element, where the scrollbar is on. Because it is on the <html> element we dont need to set it */,
      rootMargin: '64px',
      threshold: 1.0
    };
    const callback = (entries: IntersectionObserverEntry[], observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this.scoreOnceVisible = true;
          observer.unobserve(this.score.nativeElement);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(this.score.nativeElement);
  }

}
