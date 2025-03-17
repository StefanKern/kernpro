import { isPlatformBrowser, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, VERSION, Inject, PLATFORM_ID } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {DateTime} from 'luxon';
import { ScoreComponent } from '../score/score.component';

@Component({
    selector: 'core-aboutme',
    templateUrl: './aboutme.component.html',
    styleUrls: ['./aboutme.component.scss'],
    imports: [
        MatIcon,
        NgIf,
        ScoreComponent
    ]
})
export class AboutmeComponent implements OnInit {
  age = Math.floor(DateTime.fromFormat('03.10.1986', 'dd.MM.yyyy').diffNow().as('years') * -1);
  angularVersion = VERSION.major;
  scoreOnceVisible = false;
  @ViewChild('score', {read: ElementRef, static: true}) score: ElementRef;

  constructor( @Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
