import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, VERSION, PLATFORM_ID, signal, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { ScoreComponent } from '../score/score.component';

@Component({
  selector: 'core-aboutme',
  templateUrl: './aboutme.component.html',
  styleUrls: ['./aboutme.component.scss'],
  imports: [MatIcon, ScoreComponent],
})
export class AboutmeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  age = Math.floor(DateTime.now().diff(DateTime.fromFormat('03.10.1986', 'dd.MM.yyyy'), 'years').years);
  angularVersion = VERSION.major;
  scoreOnceVisible = signal(false);
  @ViewChild('score', { read: ElementRef, static: true }) score?: ElementRef;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const options = {
      rootMargin: '64px',
      threshold: 1.0,
    };
    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          this.scoreOnceVisible.set(true);
          observer.unobserve(this.score!.nativeElement);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(this.score!.nativeElement);
  }
}
