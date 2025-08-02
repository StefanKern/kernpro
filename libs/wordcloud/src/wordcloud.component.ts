import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

export type WordcloudWordSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extra-large'
  | 'huge';

export type WordcloudWord = {
  text: string;
  size: WordcloudWordSize;
  color?: string;
};

type Point = {
  x: number;
  y: number;
};

type BoundingBox = {
  x0: number; // Left edge
  x1: number; // Right edge
  y0: number; // Top edge
  y1: number; // Bottom edge
};

type PositionedBoundingBox = Point & BoundingBox;

type Tag = PositionedBoundingBox & {
  sprite?: number[];
  width: number;
};

type Sprite = Readonly<WordcloudWord> & {
  readonly font: string;
  readonly style: string;
  readonly weight: string;
  sprite?: number[];
  rotate: number;
  padding: number;
  visualSize: number; // Visual size calculated from size
  width: number;
  height: number;
  xoff: number;
  yoff: number;
  x: number;
  y: number;
  x1: number;
  y1: number;
  x0: number;
  y0: number;
  hasText: boolean;
  placed: boolean; // Track successful placement
};

@Component({
  selector: 'core-word-cloud-internal',
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
  private board?: number[] = undefined;

  /**
   * Convert wordcloud size to visual size for the word cloud
   */
  private getVisualSize(size: WordcloudWordSize): number {
    const sizeMap: Record<WordcloudWordSize, number> = {
      small: 12,
      medium: 22,
      large: 30,
      'extra-large': 45,
      huge: 65,
    };
    return sizeMap[size];
  }

  ngOnInit() {
    this.contextAndRatio = this.getContext(this.canvas);

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
      // Apply inverse scale to make content appear smaller while giving more placement space
      const visualScale = 1 / this.scaleFactor;
      this.vis.setAttribute(
        'transform',
        `translate(${[
          this.size[0] >> 1,
          this.size[1] >> 1,
        ]}) scale(${visualScale})`
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

  private animateWordsOutAndRestart() {
    // Animate existing words out first
    if (this.vis) {
      const existingTexts = Array.from(
        this.vis.querySelectorAll('text.core-word-cloud')
      ) as SVGTextElement[];

      if (existingTexts.length > 0) {
        // Animate all words out simultaneously
        existingTexts.forEach((element) => {
          // Animate to center and scale down, matching the in animation but reversed
          element.style.transition =
            'opacity 0.5s ease-out, transform 0.5s ease-out';
          element.style.opacity = '0';
          // Animate to center (0,0) and scale down
          element.style.transform = 'translate(0px, 0px) scale(0.1)';
        });

        // Wait for animation to complete, then remove and restart
        setTimeout(() => {
          // Remove all old word elements from the DOM
          existingTexts.forEach((element) => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          });
          this.resetAndRestart();
        }, 500);
      } else {
        // No existing words, restart immediately
        this.resetAndRestart();
      }
    } else {
      this.resetAndRestart();
    }
  }

  private resetAndRestart() {
    this.stop();
    this.currentRetry = 0;
    this.scaleFactor = 1.0;
    this.updateTransform();

    // Reset placement state
    this.layoutedWords.forEach((word) => {
      word.placed = false;
      word.x = 0;
      word.y = 0;
    });

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

    if (unplacedWords.length > 0 && this.currentRetry < this.maxRetries) {
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
    this.scaleFactor += this.scaleIncrement;
    this.updateTransform();

    // Reset placement state for retry
    this.layoutedWords.forEach((word) => {
      word.placed = false;
      word.x = 0;
      word.y = 0;
    });

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
      visElement.querySelectorAll('text.core-word-cloud')
    ) as SVGTextElement[];

    // Remove excess elements if we have more than needed
    for (let i = placedWords.length; i < existingTexts.length; i++) {
      const textElement = existingTexts[i];
      // Animate removal
      this.animateElementRemoval(textElement);
    }

    // Update or create text elements for each placed word
    placedWords.forEach((word, index) => {
      let textElement = existingTexts[index];

      if (!textElement) {
        // Create new text element
        textElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('class', 'core-word-cloud');
        textElement.style.pointerEvents = 'visible';
        textElement.style.cursor = 'pointer';

        // Add click handler
        textElement.addEventListener('click', () => {
          this.linkclick.emit(word.text);
        });

        visElement.appendChild(textElement);

        // Animate entrance
        this.animateElementEntrance(textElement, word);
      } else {
        // Update existing element
        this.animateElementUpdate(textElement, word);
      }
    });
  }

  private animateElementRemoval(element: SVGTextElement) {
    // Simple fade out and scale down animation
    element.style.transition = 'opacity 1s, transform 1s';
    element.style.opacity = '0';
    element.style.transform = 'translate(0, 0) rotate(0) scale(0.1)';

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 1000);
  }

  private animateElementEntrance(element: SVGTextElement, word: Sprite) {
    // Start with invisible and small
    element.style.opacity = '0';
    element.style.fontSize = '1px';
    element.style.transform = 'translate(0, 0) rotate(0)';
    element.textContent = '';
    element.style.fill = word.color || '#000000';

    // Force layout update
    element.getBoundingClientRect();

    // Animate to visible
    setTimeout(() => {
      element.style.transition = 'opacity 1s, font-size 1s, transform 1s';
      element.style.opacity = '1';
      element.style.fontSize = word.visualSize + 'px';
      element.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`;
      element.textContent = word.text;
    }, 50);
  }

  private animateElementUpdate(element: SVGTextElement, word: Sprite) {
    // Animate to new position
    element.style.transition = 'transform 1s, font-size 1s, fill 1s';
    element.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`;
    element.style.fontSize = word.visualSize + 'px';
    element.style.fill = word.color || '#000000';
    element.textContent = word.text;
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
    // eslint:disable-next-line:no-bitwise
    // Scale the board size to match the scaled boundaries
    const scaledBoardWidth = Math.ceil(this.size[0] * this.scaleFactor);
    const scaledBoardHeight = Math.ceil(this.size[1] * this.scaleFactor);
    this.board = this.zeroArray((scaledBoardWidth >> 5) * scaledBoardHeight);
    this.step();
  }

  // eslint:disable:no-bitwise
  private step() {
    let i = -1;
    const n = this.layoutedWords.length;
    const start = Date.now();
    //while (Date.now() - start < Infinity && ++i < n && this.timer) {
    while (++i < n && this.timer) {
      const d = this.layoutedWords[i];
      // Use scaled size for initial positioning
      const scaledSizeX = this.size[0] * this.scaleFactor;
      const scaledSizeY = this.size[1] * this.scaleFactor;
      // Start with random position within scaled bounds, already centered
      d.x = (scaledSizeX * (Math.random() + 0.5)) >> 1;
      d.y = (scaledSizeY * (Math.random() + 0.5)) >> 1;
      // Adjust coordinates to center based on scaled size BEFORE placement
      d.x -= scaledSizeX >> 1;
      d.y -= scaledSizeY >> 1;

      this.cloudSprite(d, this.layoutedWords, i);
      if (d.hasText && this.place(this.board!, d, this.bounds, d.text)) {
        d.placed = true; // Mark as successfully placed
        if (this.bounds) {
          this.cloudBounds(this.bounds, d);
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
  }

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private getContext(canvas: HTMLCanvasElement) {
    const context = this.canvas.getContext('2d');
    const ratio = Math.sqrt(context!.getImageData(0, 0, 1, 1).data.length >> 2);
    canvas.width = (this.cw << 5) / ratio;
    canvas.height = this.ch / ratio;

    context!.fillStyle = context!.strokeStyle = 'red';
    context!.textAlign = 'center';

    return { context: context, ratio: ratio };
  }

  private place(board: number[], tag: Tag, bounds: Point[], text: string) {
    const startX = tag.x;
    const startY = tag.y;
    // Scale up the search radius based on current scale factor
    const baseMaxDelta = Math.sqrt(
      this.size[0] * this.size[0] + this.size[1] * this.size[1]
    );
    const maxDelta = baseMaxDelta * this.scaleFactor;
    const s = this.archimedeanSpiral(this.size);
    const dt = Math.random() < 0.5 ? 1 : -1;
    let t = -dt;
    let dxdy;
    let dx;
    let dy;

    while ((dxdy = s((t += dt)))) {
      dx = ~~dxdy[0];
      dy = ~~dxdy[1];

      // Use actual distance with scaled search radius
      const actualDistance = Math.sqrt(dx * dx + dy * dy);
      if (actualDistance >= maxDelta) {
        console.warn(
          `${text} - no position found within search radius (scale: ${this.scaleFactor.toFixed(
            2
          )})`
        );
        break;
      }

      tag.x = startX + dx;
      tag.y = startY + dy;

      // Use scaled boundaries for placement - account for centered coordinate system
      const scaledSizeX = this.size[0] * this.scaleFactor;
      const scaledSizeY = this.size[1] * this.scaleFactor;
      const halfScaledX = scaledSizeX >> 1;
      const halfScaledY = scaledSizeY >> 1;

      // Check bounds with centered coordinate system
      if (
        tag.x + tag.x0 < -halfScaledX ||
        tag.y + tag.y0 < -halfScaledY ||
        tag.x + tag.x1 > halfScaledX ||
        tag.y + tag.y1 > halfScaledY
      ) {
        continue;
      }
      // TODO only check for collisions within current bounds.
      if (!bounds || !this.cloudCollide(tag, board, scaledSizeX)) {
        if (!bounds || this.collideRects(tag, bounds)) {
          const sprite = tag.sprite,
            w = tag.width >> 5,
            sw = scaledSizeX >> 5,
            // Adjust board coordinates to account for centered system
            lx = tag.x + halfScaledX - (w << 4),
            sx = lx & 0x7f,
            msx = 32 - sx,
            h = tag.y1 - tag.y0;
          let x = (tag.y + halfScaledY + tag.y0) * sw + (lx >> 5),
            last;
          for (let j = 0; j < h; j++) {
            last = 0;
            for (let i = 0; i <= w; i++) {
              board[x + i] |=
                (last << msx) |
                (i < w ? (last = sprite![j * w + i]) >>> sx : 0);
            }
            x += sw;
          }
          delete tag.sprite;
          return true;
        }
      }
    }
    return false;
  }

  // Fetches a monochrome sprite bitmap for the specified text.
  // Load in batches for speed.
  private cloudSprite(d: Sprite, data: Sprite[], di: number) {
    if (d.sprite) {
      return;
    }
    const c = this.contextAndRatio.context,
      ratio = this.contextAndRatio.ratio;

    c.clearRect(0, 0, (this.cw << 5) / ratio, this.ch / ratio);
    const n = data.length;
    let x = 0,
      y = 0,
      maxh = 0;
    --di;
    while (++di < n) {
      d = data[di];
      c.save();
      c.font =
        d.style +
        ' ' +
        d.weight +
        ' ' +
        ~~((d.visualSize + 1) / ratio) +
        'px ' +
        d.font;
      let w = c.measureText(d.text + 'm').width * ratio,
        h = d.visualSize << 1;
      if (d.rotate) {
        const sr = Math.sin(d.rotate * this.cloudRadians),
          cr = Math.cos(d.rotate * this.cloudRadians),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
        w =
          ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5) <<
          5;
        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
      } else {
        w = ((w + 0x1f) >> 5) << 5;
      }
      if (h > maxh) {
        maxh = h;
      }
      if (x + w >= this.cw << 5) {
        x = 0;
        y += maxh;
        maxh = 0;
      }
      if (y + h >= this.ch) {
        console.warn(`${d.text} is too big for the word cloud!`);
        break;
      }
      c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
      if (d.rotate) {
        c.rotate(d.rotate * this.cloudRadians);
      }
      c.fillText(d.text, 0, 0);
      if (d.padding) {
        c.lineWidth = 2 * d.padding;
        c.strokeText(d.text, 0, 0);
      }
      c.restore();
      d.width = w;
      d.height = h;
      d.xoff = x;
      d.yoff = y;
      d.x1 = w >> 1;
      d.y1 = h >> 1;
      d.x0 = -d.x1;
      d.y0 = -d.y1;
      d.hasText = true;
      x += w;
    }
    const pixels = c.getImageData(
        0,
        0,
        (this.cw << 5) / ratio,
        this.ch / ratio
      ).data,
      sprite = [];
    while (--di >= 0) {
      d = data[di];
      if (!d.hasText) {
        continue;
      }
      const w = d.width;
      const w32 = w >> 5;
      let h = d.y1 - d.y0;
      // Zero the buffer
      for (let i = 0; i < h * w32; i++) {
        sprite[i] = 0;
      }
      x = d.xoff;
      if (x == null) {
        return;
      }
      y = d.yoff;
      let seen = 0,
        seenRow = -1;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const k = w32 * j + (i >> 5),
            m = pixels[((y + j) * (this.cw << 5) + (x + i)) << 2]
              ? 1 << (31 - (i % 32))
              : 0;
          sprite[k] |= m;
          seen |= m;
        }
        if (seen) {
          seenRow = j;
        } else {
          d.y0++;
          h--;
          j--;
          y++;
        }
      }
      d.y1 = d.y0 + seenRow;
      d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
    }
  }

  private cloudCollide(tag: Tag, board: number[], sw: number) {
    const halfScaledX = sw >> 1;
    const halfScaledY = (this.size[1] * this.scaleFactor) >> 1;
    sw >>= 5;
    const sprite = tag.sprite,
      w = tag.width >> 5,
      // Adjust collision coordinates to account for centered system
      lx = tag.x + halfScaledX - (w << 4),
      sx = lx & 0x7f,
      msx = 32 - sx,
      h = tag.y1 - tag.y0;
    let x = (tag.y + halfScaledY + tag.y0) * sw + (lx >> 5),
      last;
    for (let j = 0; j < h; j++) {
      last = 0;
      for (let i = 0; i <= w; i++) {
        if (
          ((last << msx) | (i < w ? (last = sprite![j * w + i]) >>> sx : 0)) &
          board[x + i]
        ) {
          return true;
        }
      }
      x += sw;
    }
    return false;
  }

  private cloudBounds(bounds: Point[], d: PositionedBoundingBox) {
    const b0 = bounds[0],
      b1 = bounds[1];
    if (d.x + d.x0 < b0.x) {
      b0.x = d.x + d.x0;
    }
    if (d.y + d.y0 < b0.y) {
      b0.y = d.y + d.y0;
    }
    if (d.x + d.x1 > b1.x) {
      b1.x = d.x + d.x1;
    }
    if (d.y + d.y1 > b1.y) {
      b1.y = d.y + d.y1;
    }
  }

  private collideRects(a: PositionedBoundingBox, b: Point[]) {
    return (
      a.x + a.x1 > b[0].x &&
      a.x + a.x0 < b[1].x &&
      a.y + a.y1 > b[0].y &&
      a.y + a.y0 < b[1].y
    );
  }

  private archimedeanSpiral(size: number[]) {
    const e = size[0] / size[1];
    return function (t: number) {
      return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
  }

  private zeroArray(n: number) {
    const a = [];
    let i = -1;
    while (++i < n) {
      a[i] = 0;
    }
    return a;
  }
}

@Component({
  selector: 'core-word-cloud',
  template: `
    @if (isPlatformBrowser) {
    <div class="wordcloud-container" #container>
      @if (showLoader()) {
      <div class="wordcloud-loading">
        <ng-content select="[slot=loader]">
          <!-- Fallback simple CSS spinner if no custom loader provided -->
          <div class="default-spinner"></div>
          <p>Loading...</p>
        </ng-content>
      </div>
      } @if (visible()) {
      <core-word-cloud-internal
        [words]="internalWords"
        (layoutComplete)="onLayoutComplete()"
      ></core-word-cloud-internal>
      }
    </div>
    }
  `,
  styles: [
    `
      .wordcloud-container {
        position: relative;
        width: 100%;
        aspect-ratio: 640 / 360;
      }

      .wordcloud-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2;
        opacity: 1;
        transition: opacity 0.3s ease-out;
      }

      .wordcloud-loading p {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
      }

      .default-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      core-word-cloud-internal {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transition: opacity 0.3s ease-in;
      }
    `,
  ],
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
