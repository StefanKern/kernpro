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
  Point,
  Size,
  SizedSprite,
  Sprite,
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
  private bounds: [Point, Point] | undefined = undefined;
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
    visElement.querySelector('.loading-text')?.remove();

    // Get all existing text elements (excluding loading text which should now be gone)
    const existingTexts = Array.from(visElement.querySelectorAll('text.kp-wordcloud')) as SVGTextElement[];

    // Remove excess elements if we have more than needed
    for (let i = placedWords.length; i < existingTexts.length; i++) {
      animateElementRemoval(existingTexts[i]);
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
        return createSizedSprite(wcw, visualSize);
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
      const current = this.layoutedWords[i];

      // Pipeline: Sized -> (generateWordSprites) -> Placing -> (placeWord) -> Placed | Unplaceable
      const advanced = this.advanceSpritePipeline(current);
      this.layoutedWords[i] = advanced;

      if (isPlacedSprite(advanced)) {
        // Update bounds when a word becomes placed
        if (this.bounds) {
          updateCloudBounds(this.bounds, advanced);
        } else {
          this.bounds = [
            { x: advanced.x + advanced.x0, y: advanced.y + advanced.y0 },
            { x: advanced.x + advanced.x1, y: advanced.y + advanced.y1 },
          ];
        }
      }
      // Unplaceable sprites remain as-is; no retries occur with the fixed-size layout.
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

  // Drives a sprite through the placement pipeline in one step, making the flow explicit.
  // - If Sized: generate → Placing | Unplaceable
  // - If Placing: place → Placed | Unplaceable
  // - If Placed or Unplaceable: return as-is
  private advanceSpritePipeline(sprite: Sprite): Sprite {
    // Already terminal states
    if (isPlacedSprite(sprite)) return sprite;

    // Stage 1: ensure we have a Placing sprite (or Unplaceable)
    let stage: Sprite = sprite;
    if (!isPlacingSprite(stage)) {
      stage = generateWordSprites(stage as SizedSprite, this.contextAndRatio, this.cw, this.ch, this.cloudRadians);
    }

    // Stage 2: try to place if still Placing
    if (isPlacingSprite(stage)) {
      stage = placeWord(stage, this.board!, this.bounds, this.size);
    }

    return stage;
  }

  private stop() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = undefined;
    }
  }
}
