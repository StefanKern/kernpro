import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  WordcloudWord,
  WordcloudWordSize,
  Point,
  BoundingBox,
  PositionedBoundingBox,
  Tag,
  Sprite,
} from './types';
import { placeWord, updateCloudBounds } from './wordcloud-layout.functions';
import {
  createCanvasContext,
  generateWordSprites,
  getVisualSize,
} from './wordcloud-canvas.functions';
import {
  animateElementEntrance,
  animateElementUpdate,
  animateElementRemoval,
  animateWordsOut,
  createWordElement,
} from './wordcloud-animation.functions';
import {
  calculateTransform,
  calculateScaledBoardSize,
  shouldRetryWithScaling,
  calculateNextScaleFactor,
  resetWordPlacementState,
  calculateInitialPosition,
} from './wordcloud-scaling.functions';

@Component({
  selector: 'kp-wordcloud-internal',
  template: '<svg #svg></svg>',
  styles: [
    `
      :host {
        display: block;
      }
      text {
        cursor: pointer;
      }
    `,
  ],
  standalone: true,
})
export class WordcloudComponentInternal implements OnInit, OnDestroy {
  private initComplete = false;
  private destroy$ = new Subject<void>();
  @ViewChild('svg', { static: true }) svgElementRef!: ElementRef;

  @Output() linkclick = new EventEmitter<string>();
  @Output() layoutComplete = new EventEmitter<void>();
  @Output() layoutStarted = new EventEmitter<void>();

  private _words: WordcloudWord[] = [];
  @Input()
  public get words(): WordcloudWord[] {
    return this._words;
  }
  public set words(newWords) {
    this._words = newWords;
    if (this.initComplete) {
      this.animateWordsOutAndRestart();
    }
  }

  private layoutedWords: Sprite[] = [];

  // Adaptive scaling properties
  private scaleFactor = 1.0; // Start with no scaling
  private maxRetries = 5;
  private currentRetry = 0;
  private scaleIncrement = 0.1; // 10% increase each retry

  private svg: SVGSVGElement | null = null;
  private vis: SVGGElement | null = null;
  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private contextAndRatio: any;
  private timer?: any = undefined;
  private size = [640, 360]; // 16:9 aspect ratio

  private cloudRadians = Math.PI / 180;
  // eslint:disable-next-line:no-bitwise
  private cw = (1 << 11) >> 5;
  // eslint:disable-next-line:no-bitwise
  private ch = 1 << 11;
  private bounds: any = undefined;
  private board?: Int32Array = undefined;

  /**
   * Convert wordcloud size to visual size for the word cloud
   */
  private getVisualSize(size: WordcloudWordSize): number {
    return getVisualSize(size);
  }

  ngOnInit() {
    this.contextAndRatio = createCanvasContext(this.canvas, this.cw, this.ch);

    this.svg = this.svgElementRef.nativeElement as SVGSVGElement;
    this.vis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.vis.setAttribute(
      'transform',
      `translate(${[this.size[0] >> 1, this.size[1] >> 1]})`
    );
    this.svg.appendChild(this.vis);

    // Create loading text with native DOM
    const loadingText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    loadingText.textContent = 'Wordcloud wird erstellt';
    loadingText.setAttribute('text-anchor', 'middle');
    loadingText.setAttribute('class', 'loading-text');
    loadingText.style.fill = 'black';
    this.vis.appendChild(loadingText);

    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', `0 0 ${this.size[0]} ${this.size[1]}`);

    this.initComplete = true;
    this.startWithRetry();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stop();
  }

  private updateTransform() {
    if (this.vis) {
      this.vis.setAttribute(
        'transform',
        calculateTransform(this.size, this.scaleFactor)
      );
    }
  }

  private startWithRetry() {
    this.currentRetry = 0;
    this.scaleFactor = 1.0;
    this.updateTransform();
    this.layoutStarted.emit();
    this.start();
  }

  private async animateWordsOutAndRestart() {
    if (this.vis) {
      await animateWordsOut(this.vis);
    }
    this.resetAndRestart();
  }

  private resetAndRestart() {
    this.stop();
    this.currentRetry = 0;
    this.scaleFactor = 1.0;
    this.updateTransform();

    // Reset placement state
    resetWordPlacementState(this.layoutedWords);

    this.start();
  }

  private handleLayoutComplete() {
    const unplacedWords = this.layoutedWords.filter(
      (word) => word.hasText && !word.placed
    );
    const placedWords = this.layoutedWords.filter(
      (word) => word.hasText && word.placed
    );

    console.log(
      `Layout complete: ${placedWords.length}/${
        this.layoutedWords.filter((w) => w.hasText).length
      } words placed, scale factor: ${this.scaleFactor.toFixed(2)}`
    );

    if (
      shouldRetryWithScaling(
        unplacedWords.length,
        this.currentRetry,
        this.maxRetries
      )
    ) {
      console.log(
        `Retry ${this.currentRetry + 1}/${this.maxRetries}: ${
          unplacedWords.length
        } words didn't fit, scaling up...`
      );
      this.retryWithLargerScale();
    } else {
      if (unplacedWords.length > 0) {
        console.warn(
          `Final attempt: ${unplacedWords.length} words could not be placed after ${this.maxRetries} retries`
        );
      }
      this.redrawWordCloud();
      // Emit that words have been animated in after redraw
      setTimeout(() => {
        this.layoutComplete.emit();
      }, 100);
    }
  }

  private retryWithLargerScale() {
    this.currentRetry++;
    this.scaleFactor = calculateNextScaleFactor(
      this.scaleFactor,
      this.scaleIncrement
    );
    this.updateTransform();

    // Reset placement state for retry
    resetWordPlacementState(this.layoutedWords);

    // Reset layout state and restart
    this.stop();
    this.start();
  }

  private redrawWordCloud() {
    // Only filter for successfully placed words
    const placedWords = this.layoutedWords.filter(
      (word) => word.hasText && word.placed
    );

    console.log(
      `Rendering ${placedWords.length}/${
        this.layoutedWords.filter((w) => w.hasText).length
      } words`
    );

    if (!this.vis) return;

    const visElement = this.vis;

    // Remove loading text if it exists
    const loadingText = visElement.querySelector('.loading-text');
    if (loadingText) {
      loadingText.remove();
    }

    // Get all existing text elements (excluding loading text which should now be gone)
    const existingTexts = Array.from(
      visElement.querySelectorAll('text.kp-wordcloud')
    ) as SVGTextElement[];

    // Remove excess elements if we have more than needed
    for (let i = placedWords.length; i < existingTexts.length; i++) {
      const textElement = existingTexts[i];
      // Animate removal
      animateElementRemoval(textElement);
    }

    // Update or create text elements for each placed word
    placedWords.forEach((word, index) => {
      let textElement = existingTexts[index];

      if (!textElement) {
        // Create new text element
        textElement = createWordElement(word, (text) =>
          this.linkclick.emit(text)
        );
        visElement.appendChild(textElement);

        // Animate entrance
        animateElementEntrance(textElement, word);
      } else {
        // Update existing element
        animateElementUpdate(textElement, word);
      }
    });
  }

  private start() {
    this.bounds = undefined;
    this.board = undefined;
    this.layoutedWords = this.words
      .map(
        (d): Sprite => ({
          ...d,
          visualSize: this.getVisualSize(d.size), // Calculate visual size from size
          font: 'serif',
          style: 'normal',
          weight: 'normal',
          // max rotation of +/-20 degree
          rotate: Math.random() * 40 - 20, // -20 to +20 degrees
          padding: 3,
          sprite: undefined,
          width: 0,
          height: 0,
          xoff: 0,
          yoff: 0,
          x: 0,
          y: 0,
          x1: 0,
          y1: 0,
          x0: 0,
          y0: 0,
          hasText: false,
          placed: false,
        })
      )
      .sort((a, b) => b.visualSize - a.visualSize);

    // Early exit: if there are no words, trigger layoutComplete and return
    if (!this.layoutedWords.length) {
      this.layoutComplete.emit();
      return;
    }

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(this.step, 0); // TODO: use requestAnimationFrame

    // Scale the board size to match the scaled boundaries
    const boardSize = calculateScaledBoardSize(this.size, this.scaleFactor);
    this.board = new Int32Array((boardSize.width >> 5) * boardSize.height);
    this.step();
  }

  // eslint:disable:no-bitwise
  private step = () => {
    let i = -1;
    const n = this.layoutedWords.length;
    const start = Date.now();
    //while (Date.now() - start < Infinity && ++i < n && this.timer) {
    while (++i < n && this.timer) {
      const d = this.layoutedWords[i];

      // Use helper function for initial positioning
      const position = calculateInitialPosition(this.size, this.scaleFactor);
      d.x = position.x;
      d.y = position.y;

      generateWordSprites(
        [d],
        this.contextAndRatio,
        this.cw,
        this.ch,
        this.cloudRadians
      );

      if (
        d.hasText &&
        placeWord(
          this.board!,
          d,
          this.bounds,
          d.text,
          this.size,
          this.scaleFactor
        )
      ) {
        d.placed = true; // Mark as successfully placed
        if (this.bounds) {
          updateCloudBounds(this.bounds, d);
        } else {
          this.bounds = [
            { x: d.x + d.x0, y: d.y + d.y0 },
            { x: d.x + d.x1, y: d.y + d.y1 },
          ];
        }
      } else if (d.hasText) {
        // Reset coordinates for failed placement to ensure proper retry logic
        d.placed = false;
        d.x = undefined as any;
        d.y = undefined as any;
      }
    }
    if (i >= n) {
      this.stop();
      // Call handleLayoutComplete directly instead of emitting
      this.handleLayoutComplete();
    }
  };

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
