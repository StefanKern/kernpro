import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { WordcloudComponentInternal } from './wordcloud-internal.component';
import { WordcloudWord } from './types';

@Component({
  selector: 'core-word-cloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.scss'],
  standalone: true,
  imports: [WordcloudComponentInternal],
})
export class WordcloudComponent implements AfterViewInit, OnDestroy {
  words = input<WordcloudWord[]>([]);
  loading = input(false);

  showLoader = signal(false);
  isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  visible = signal(false);

  @ViewChild('container', { static: false }) containerRef?: ElementRef;
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    if (!this.isPlatformBrowser) return;
    if (!this.containerRef?.nativeElement) return;
    this.observer = new IntersectionObserver(
      (entries, observeRef) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0 && !this.visible()) {
            this.visible.set(true);
            if (this.observer && this.containerRef?.nativeElement) {
              this.observer.unobserve(this.containerRef.nativeElement);
            }
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: [0, 0.1, 1],
      }
    );
    this.observer.observe(this.containerRef.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer && this.containerRef?.nativeElement) {
      this.observer.unobserve(this.containerRef.nativeElement);
    }
  }

  // Pass empty array to internal wordcloud when loading, otherwise pass words
  get internalWords() {
    return this.loading() ? [] : this.words();
  }

  onLayoutComplete() {
    // When loading, show loader after internal wordcloud completes
    if (this.loading()) {
      this.showLoader.set(true);
    } else {
      this.showLoader.set(false);
    }
  }
}
