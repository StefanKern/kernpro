import { Sprite, PlacingSprite, CanvasContextAndRatio } from './types';

/**
 * Creates and configures a canvas context for wordcloud rendering
 */
export function createCanvasContext(canvas: HTMLCanvasElement, cw: number, ch: number): CanvasContextAndRatio {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to get 2D canvas context');
  }

  const ratio = Math.sqrt(context.getImageData(0, 0, 1, 1).data.length >> 2);
  canvas.width = (cw << 5) / ratio;
  canvas.height = ch / ratio;

  context.fillStyle = context.strokeStyle = 'red';
  context.textAlign = 'center';

  return { context, ratio };
}

/**
 * Generates sprites for all words in a batch for performance
 */
export function generateWordSprites(
  data: Sprite[],
  contextAndRatio: CanvasContextAndRatio,
  cw: number,
  ch: number,
  cloudRadians: number
): void {
  const c = contextAndRatio.context;
  const ratio = contextAndRatio.ratio;

  c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
  const n = data.length;
  let x = 0,
    y = 0,
    maxh = 0;

  // First pass: render all text and calculate positions
  for (let di = 0; di < n; di++) {
    const d = data[di];
    c.save();
    c.font = `${d.style} ${d.weight} ${~~((d.visualSize + 1) / ratio)}px ${d.font}`;

    let w = c.measureText(d.text + 'm').width * ratio;
    let h = d.visualSize << 1;

    if (d.rotate) {
      const sr = Math.sin(d.rotate * cloudRadians);
      const cr = Math.cos(d.rotate * cloudRadians);
      const wcr = w * cr;
      const wsr = w * sr;
      const hcr = h * cr;
      const hsr = h * sr;
      w = ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5) << 5;
      h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
    } else {
      w = ((w + 0x1f) >> 5) << 5;
    }

    if (h > maxh) {
      maxh = h;
    }
    if (x + w >= cw << 5) {
      x = 0;
      y += maxh;
      maxh = 0;
    }
    if (y + h >= ch) {
      console.warn(`${d.text} is too big for the word cloud!`);
      break;
    }

    c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
    if (d.rotate) {
      c.rotate(d.rotate * cloudRadians);
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

  // Second pass: extract pixel data and create sprites
  const pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data;

  for (let di = n - 1; di >= 0; di--) {
    const d = data[di];
    if (!d.hasText) {
      continue;
    }

    const w = d.width;
    const w32 = w >> 5;
    let h = d.y1 - d.y0;
    const sprite = [];

    // Zero the buffer
    for (let i = 0; i < h * w32; i++) {
      sprite[i] = 0;
    }

    x = d.xoff;
    if (x == null) {
      return;
    }
    y = d.yoff;
    let seen = 0;
    let seenRow = -1;

    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = w32 * j + (i >> 5);
        const m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
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

/**
 * Converts wordcloud size enum to pixel size
 */
export function getVisualSize(size: string): number {
  const sizeMap: Record<string, number> = {
    small: 12,
    medium: 22,
    large: 30,
    'extra-large': 45,
    huge: 65,
  };
  return sizeMap[size] || 22;
}
