import {Component, ElementRef, NgZone, OnInit, ViewChild, Input, PLATFORM_ID, Inject, Output, EventEmitter} from '@angular/core';
import * as d3Dispatch from 'd3-dispatch';

import {
  D3Service,
  D3
} from 'd3-ng2-service';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'word-cloud',
  template: '<svg #svg></svg>',
  styles: [`:host {
    display: block;
  }`]
})
export class WordcloudComponent implements OnInit {
  private initComplete = false;
  @ViewChild('svg', {static: true}) svgElementRef: ElementRef;

  private _words: Array<iWord> = [];
  @Input()
  public get words(): Array<iWord> {
    return this._words;
  }

  @Output() linkclick = new EventEmitter<string>();

  public set words(newWords) {
    this._words = newWords;
    if (this.event) {
      this.event.call('wordschange');
    }
  }

  private layoutedWords: Array<any> = [];

  private svg = null;
  private vis = null;
  private readonly canvas: HTMLCanvasElement = null;
  private contextAndRatio: any;
  private readonly event: d3Dispatch.Dispatch<EventTarget> = null;
  private timer = null;
  private size = [640, 360]; // 16:9 aspect ratio

  private cloudRadians = Math.PI / 180;
  // tslint:disable-next-line:no-bitwise
  private cw = 1 << 11 >> 5;
  // tslint:disable-next-line:no-bitwise
  private ch = 1 << 11;
  private bounds: any = null;
  private board;

  constructor(private element: ElementRef, private ngZone: NgZone, private d3Service: D3Service,
              @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.canvas = document.createElement('canvas');
      console.log('constructor');
      this.event = d3Dispatch.dispatch('wordschange', 'word', 'end');
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const d3 = this.d3Service.getD3();
      this.contextAndRatio = this.getContext(this.canvas);

      if (this.svgElementRef.nativeElement !== null) {
        this.svg = d3.select(this.svgElementRef.nativeElement);
        // tslint:disable-next-line:no-bitwise
        this.vis = this.svg.append('g').attr('transform', `translate(${[this.size[0] >> 1, this.size[1] >> 1]})`);

        this.svg.attr('width', '100%');
        this.svg.attr('height', '100%');
        this.svg.attr('viewBox', `0 0 ${this.size[0]} ${this.size[1]}`);

        this.drawWordcloudWhenVisible();
      }
    }
  }

  private drawWordcloudWhenVisible() {
    console.log('drawWordcloudWhenVisible');
    const options = {
      root: document.querySelector('#SidenavContent'),
      rootMargin: '0px',
      threshold: [0, 0.1, 1]
    };
    const callback = (entries, observeRef) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0 && !this.initComplete) {
          this.event.on('end', () => {
            this.redrawWordCloud();
          });
          this.event.on('wordschange', () => {
            if (this.initComplete) {
              this.stop();
              this.start();
            } else {
              this.hiddenDraw();
            }
          });

          this.start();
          this.hiddenDraw();
          this.initComplete = true;

          observeRef.unobserve(this.svgElementRef.nativeElement);
          console.log('wordcloud complete');
        } else {
          console.log('whatever');
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(this.svgElementRef.nativeElement);
  }

  private hiddenDraw() {
    console.log('hiddenDraw');
    this.vis
      .selectAll('text')
      .data(this.layoutedWords)
      .enter()
      .append('text')
      .style('fill', d => d.color)
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(0, 0)rotate(0)`)
      .style('font-size', '1px')
      .attr('class', 'word-cloud')
      .text(d => {
        return d.text;
      });
  }

  private redrawWordCloud() {
    console.log('redrawWordCloud');
    const eWords = this.vis.selectAll('text')
      .data(this.layoutedWords);

    // remove words
    eWords.exit()
      .transition()
      .duration(1e3)
      .attr('transform', d => `translate(0, 0)rotate(0)`)
      .style('font-size', '1px')
      .remove();

    // add words
    eWords.enter()
      .append('text')
      .text('')
      .style('pointer-events', 'visible')
      .on('click', (data) => {
        this.linkclick.emit(data.text);
      })
      .transition()
      .duration(1e3)
      .attr('transform', d => `translate(0, 0)rotate(0)`)
      .style('font-size', '1px')
      .attr('text-anchor', 'middle')
      .attr('class', 'word-cloud')
      .style('fill', d => d.color)
      .transition()
      .duration(1e3)
      .text(d => d.text)
      .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .style('font-size', t => t.size + 'px');

    // update the position
    eWords.transition()
      .duration(1e3)
      .attr('transform', d => `translate(0, 0)rotate(0)`)
      .style('font-size', '1px')
      .transition()
      .duration(1e3)
      .text(d => {
        return d.text;
      })
      .style('fill', d => d.color)
      .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .style('font-size', t => t.size + 'px');
  }


  private start() {
    this.bounds = null;
    this.board = null;
    this.layoutedWords = this.words.map((d, i) => {
      d.font = 'serif';
      d.style = 'normal';
      d.weight = 'normal';
      // tslint:disable-next-line:no-bitwise
      d.rotate = (~~(Math.random() * 6) - 3) * 30;
      d.padding = 3;
      return d;
    }).sort((a, b) => b.size - a.size);

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(this.step, 0);
    // tslint:disable-next-line:no-bitwise
    this.board = this.zeroArray((this.size[0] >> 5) * this.size[1]);
    this.step();
  }

  // tslint:disable:no-bitwise
  private step() {
    let i = -1;
    const n = this.layoutedWords.length;
    const start = Date.now();
    while (Date.now() - start < Infinity && ++i < n && this.timer) {
      const d = this.layoutedWords[i];
      d.x = (this.size[0] * (Math.random() + .5)) >> 1;
      d.y = (this.size[1] * (Math.random() + .5)) >> 1;
      this.cloudSprite(d, this.layoutedWords, i);
      if (d.hasText && this.place(this.board, d, this.bounds)) {
        this.event.call('word');
        if (this.bounds) {
          this.cloudBounds(this.bounds, d);
        } else {
          this.bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
        }
        // Temporary hack
        d.x -= this.size[0] >> 1;
        d.y -= this.size[1] >> 1;
      }
    }
    if (i >= n) {
      this.stop();
      this.event.call('end');
    }
  }

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getContext(canvas) {
    const context = this.canvas.getContext('2d');
    const ratio = Math.sqrt(context.getImageData(0, 0, 1, 1).data.length >> 2);
    canvas.width = (this.cw << 5) / ratio;
    canvas.height = this.ch / ratio;

    context.fillStyle = context.strokeStyle = 'red';
    context.textAlign = 'center';

    return {context: context, ratio: ratio};
  }

  private place(board, tag, bounds) {
    const perimeter = [{x: 0, y: 0}, {x: this.size[0], y: this.size[1]}];
    const startX = tag.x;
    const startY = tag.y;
    const maxDelta = Math.sqrt(this.size[0] * this.size[0] + this.size[1] * this.size[1]);
    const s = this.archimedeanSpiral(this.size);
    const dt = Math.random() < .5 ? 1 : -1;
    let t = -dt;
    let dxdy;
    let dx;
    let dy;

    while (dxdy = s(t += dt)) {
      dx = ~~dxdy[0];
      dy = ~~dxdy[1];

      if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) {
        break;
      }

      tag.x = startX + dx;
      tag.y = startY + dy;

      if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
        tag.x + tag.x1 > this.size[0] || tag.y + tag.y1 > this.size[1]) {
        continue;
      }
      // TODO only check for collisions within current bounds.
      if (!bounds || !this.cloudCollide(tag, board, this.size[0])) {
        if (!bounds || this.collideRects(tag, bounds)) {
          const sprite = tag.sprite,
            w = tag.width >> 5,
            sw = this.size[0] >> 5,
            lx = tag.x - (w << 4),
            sx = lx & 0x7f,
            msx = 32 - sx,
            h = tag.y1 - tag.y0;
          let x = (tag.y + tag.y0) * sw + (lx >> 5),
            last;
          for (let j = 0; j < h; j++) {
            last = 0;
            for (let i = 0; i <= w; i++) {
              board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
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
  private cloudSprite(d, data, di) {
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
      c.font = d.style + ' ' + d.weight + ' ' + ~~((d.size + 1) / ratio) + 'px ' + d.font;
      let w = c.measureText(d.text + 'm').width * ratio,
        h = d.size << 1;
      if (d.rotate) {
        const sr = Math.sin(d.rotate * this.cloudRadians),
          cr = Math.cos(d.rotate * this.cloudRadians),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
        w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
      } else {
        w = (w + 0x1f) >> 5 << 5;
      }
      if (h > maxh) {
        maxh = h;
      }
      if (x + w >= (this.cw << 5)) {
        x = 0;
        y += maxh;
        maxh = 0;
      }
      if (y + h >= this.ch) {
        break;
      }
      c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
      if (d.rotate) {
        c.rotate(d.rotate * this.cloudRadians);
      }
      c.fillText(d.text, 0, 0);
      if (d.padding) {
        c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
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
    const pixels = c.getImageData(0, 0, (this.cw << 5) / ratio, this.ch / ratio).data,
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
            m = pixels[((y + j) * (this.cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
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

  private cloudCollide(tag, board, sw) {
    sw >>= 5;
    const sprite = tag.sprite,
      w = tag.width >> 5,
      lx = tag.x - (w << 4),
      sx = lx & 0x7f,
      msx = 32 - sx,
      h = tag.y1 - tag.y0;
    let x = (tag.y + tag.y0) * sw + (lx >> 5),
      last;
    for (let j = 0; j < h; j++) {
      last = 0;
      for (let i = 0; i <= w; i++) {
        if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0))
          & board[x + i]) {
          return true;
        }
      }
      x += sw;
    }
    return false;
  }

  private cloudBounds(bounds, d) {
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

  private collideRects(a, b) {
    return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
  }

  private archimedeanSpiral(size) {
    const e = size[0] / size[1];
    return function (t) {
      return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
    };
  }

  private rectangularSpiral(size) {
    let dy = 4,
      x = 0,
      y = 0;
    const dx = dy * size[0] / size[1];
    return function (t) {
      const sign = t < 0 ? -1 : 1;
      // See triangular numbers: T_n = n * (n + 1) / 2.
      switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
        case 0:
          x += dx;
          break;
        case 1:
          y += dy;
          break;
        case 2:
          x -= dx;
          break;
        default:
          y -= dy;
          break;
      }
      return [x, y];
    };
  }

  private zeroArray(n) {
    const a = [];
    let i = -1;
    while (++i < n) {
      a[i] = 0;
    }
    return a;
  }
}
