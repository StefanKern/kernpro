import { isPlatformBrowser } from '@angular/common';
import {
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
import { Subject } from 'rxjs';
import {
  createSizedSprite,
  isPlacedSprite,
  isPlacingSprite,
  isSizedSprite,
  PlacingSprite,
  Size,
  SizedSprite,
  Sprite,
  toPlacedSprite,
  WordcloudWord,
} from './types';
import {
  animateElementEntrance,
  animateElementRemoval,
  animateElementUpdate,
  animateWordsOut,
  createWordElement,
} from './wordcloud-animation.functions';
import { createCanvasContext, generateWordSprites, getVisualSize } from './wordcloud-canvas.functions';
import { placeWord, updateCloudBounds } from './wordcloud-layout.functions';
// Removed adaptive scaling utilities (calculateTransform, scaling retries) – no enlargement logic anymore.

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
  private platformId = inject(PLATFORM_ID);
  @ViewChild('svg', { static: true }) svgElementRef!: ElementRef;

  @Output() linkclick = new EventEmitter<string>();
  @Output() layoutComplete = new EventEmitter<void>();
  @Output() layoutStarted = new EventEmitter<void>();

  private _size: Size = { width: 640, height: 360 }; // 16:9 aspect ratio
  @Input()
  public get size(): Size {
    return this._size;
  }
  public set size(newSize: Size) {
    if (this._size.width !== newSize.width || this._size.height !== newSize.height) {
      this._size = newSize;
      if (this.initComplete && isPlatformBrowser(this.platformId)) {
        this.updateViewBox();
        this.updateTransform();
        this.animateWordsOutAndRestart();
      }
    }
  }

  private _words: WordcloudWord[] = [];
  @Input()
  public get words(): WordcloudWord[] {
    return this._words;
  }
  public set words(newWords: WordcloudWord[]) {
    // Only update if words actually changed to prevent infinite loops
    if (this._words !== newWords && JSON.stringify(this._words) !== JSON.stringify(newWords)) {
      this._words = newWords;
      if (this.initComplete && isPlatformBrowser(this.platformId)) {
        this.animateWordsOutAndRestart();
      }
    }
  }

  private layoutedWords: Sprite[] = [];

  // Removed adaptive scaling properties – single fixed-size layout.

  private svg: SVGSVGElement | null = null;
  private vis: SVGGElement | null = null;
  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private contextAndRatio: any;
  private timer?: any = undefined;

  private cloudRadians = Math.PI / 180;
  // eslint:disable-next-line:no-bitwise
  private cw = (1 << 11) >> 5;
  // eslint:disable-next-line:no-bitwise
  private ch = 1 << 11;
  private bounds: any = undefined;
  private board?: Int32Array = undefined;

  ngOnInit() {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.contextAndRatio = createCanvasContext(this.canvas, this.cw, this.ch);

    this.svg = this.svgElementRef.nativeElement as SVGSVGElement;
    this.vis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.vis.setAttribute('transform', `translate(${[this.size.width >> 1, this.size.height >> 1]})`);
    this.svg.appendChild(this.vis);

    // Create loading text with native DOM
    const loadingText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    loadingText.textContent = 'Wordcloud wird erstellt';
    loadingText.setAttribute('text-anchor', 'middle');
    loadingText.setAttribute('class', 'loading-text');
    loadingText.style.fill = 'black';
    this.vis.appendChild(loadingText);

    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.updateViewBox();

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
      this.vis.setAttribute('transform', `translate(${[this.size.width >> 1, this.size.height >> 1]})`);
    }
  }

  private updateViewBox() {
    if (this.svg) {
      this.svg.setAttribute('viewBox', `0 0 ${this.size.width} ${this.size.height}`);
    }
  }

  private startWithRetry() {
    // Kept method name for compatibility – now just a single start.
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
    this.updateTransform();
    this.start();
  }

  private handleLayoutComplete() {
    const placedWords = this.layoutedWords.filter((word) => isPlacedSprite(word));
    const totalAttempted = this.layoutedWords.filter((w) => isPlacingSprite(w)).length;
    console.log(`Layout complete: ${placedWords.length}/${totalAttempted} words placed (no adaptive scaling)`);
    const unplaced = this.layoutedWords.filter((word) => !isPlacedSprite(word));
    if (unplaced.length) {
      console.warn(`${unplaced.length} words could not be placed within the fixed area.`);
    }
    this.redrawWordCloud();
    setTimeout(() => this.layoutComplete.emit(), 100);
  }

  private redrawWordCloud() {
    // Only filter for successfully placed words
    const placedWords = this.layoutedWords.filter((word) => isPlacedSprite(word));
    console.log(`Rendering ${placedWords.length}/${this.layoutedWords.filter((w) => isPlacingSprite(w)).length} words`);

    if (!this.vis) return;

    const visElement = this.vis;

    // Remove loading text if it exists
    const loadingText = visElement.querySelector('.loading-text');
    if (loadingText) {
      loadingText.remove();
    }

    // Get all existing text elements (excluding loading text which should now be gone)
    const existingTexts = Array.from(visElement.querySelectorAll('text.kp-wordcloud')) as SVGTextElement[];

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
        textElement = createWordElement(word, (text) => this.linkclick.emit(text));
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
      .map((wcw: WordcloudWord): SizedSprite => {
        const visualSize = getVisualSize(wcw.size);
        return createSizedSprite(wcw, visualSize, this._size.height, this._size.width);
      })
      .sort((a, b) => b.visualSize - a.visualSize);

    // Early exit: if there are no words, trigger layoutComplete and return
    if (!this.layoutedWords.length) {
      this.layoutComplete.emit();
      return;
    }

    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }

    // Board now always matches component size
    const boardSize = { width: this.size.width, height: this.size.height };
    this.board = new Int32Array((boardSize.width >> 5) * boardSize.height);
    this.scheduleNextStep();
  }

  private scheduleNextStep = () => {
    this.timer = requestAnimationFrame(this.step);
  };

  // eslint:disable:no-bitwise
  private step = () => {
    let i = -1;
    const n = this.layoutedWords.length;
    const start = Date.now();
    const maxProcessingTime = 16; // Limit processing to ~16ms per frame for smooth animation

    // Process words until time limit or all words processed
    while (Date.now() - start < maxProcessingTime && ++i < n && this.timer) {
      const d = this.layoutedWords[i];

      // Skip already placed
      if (isPlacedSprite(d)) {
        continue;
      }

      // For sized sprites, generate metrics and transition to placing
      if (isSizedSprite(d)) {
        generateWordSprites(d, this.contextAndRatio, this.cw, this.ch, this.cloudRadians, this.size);
      }

      // Attempt placement for placing sprites
      if (isPlacingSprite(d) && placeWord(this.board!, d, this.bounds, d.text, this.size)) {
        // Replace with placed sprite
        const placedSprite = (this.layoutedWords[i] = toPlacedSprite(d as PlacingSprite));

        if (this.bounds) {
          updateCloudBounds(this.bounds, placedSprite);
        } else {
          this.bounds = [
            {
              x: placedSprite.x + placedSprite.x0,
              y: placedSprite.y + placedSprite.y0,
            },
            {
              x: placedSprite.x + placedSprite.x1,
              y: placedSprite.y + placedSprite.y1,
            },
          ];
        }
      }
      // Failed placements remain in placing state; no retries will occur.
    }

    if (i >= n) {
      this.stop();
      // Call handleLayoutComplete directly instead of emitting
      this.handleLayoutComplete();
    } else if (this.timer) {
      // Schedule next step if there are more words to process
      this.scheduleNextStep();
    }
  };

  private stop() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = undefined;
    }
  }
}
