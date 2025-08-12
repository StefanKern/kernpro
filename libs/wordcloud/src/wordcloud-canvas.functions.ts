import { Sprite, CanvasContextAndRatio, Size, SizedSprite, PlacingSprite, toPlacingSprite } from './types';

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
 * Also sets initial random positions for the words
 */
// Renders the word to the canvas, computes metrics, and sets initial position and offsets
function renderSingleWord(
  d: SizedSprite,
  contextAndRatio: CanvasContextAndRatio,
  cw: number,
  ch: number,
  cloudRadians: number,
  size: Size
): PlacingSprite {
  const c = contextAndRatio.context;
  const ratio = contextAndRatio.ratio;

  // Clear canvas for this draw
  c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);

  // Random initial position (centered coordinate system used by layout)
  const initialAreaWidth = size.width;
  const initialAreaHeight = size.height;
  let initialX = (initialAreaWidth * (Math.random() + 0.5)) >> 1;
  let initialY = (initialAreaHeight * (Math.random() + 0.5)) >> 1;
  initialX -= initialAreaWidth >> 1;
  initialY -= initialAreaHeight >> 1;

  // Measure and render at origin of the sprite sheet
  let x = 0;
  let y = 0;
  let maxh = 0;

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

  if (h > maxh) maxh = h;
  if (x + w >= cw << 5) {
    x = 0;
    y += maxh;
    maxh = 0;
  }
  if (y + h >= ch) {
    console.warn(`${d.text} is too big for the word cloud!`);
    c.restore();
    throw 'TODO: Text cannot be laced';
  }

  c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
  if (d.rotate) c.rotate(d.rotate * cloudRadians);
  c.fillText(d.text, 0, 0);
  if (d.padding) {
    c.lineWidth = 2 * d.padding;
    c.strokeText(d.text, 0, 0);
  }
  c.restore();

  // Persist metrics to sprite and convert to placing state at the end
  d.width = w;
  d.height = h;
  const xoff = x;
  const yoff = y;
  const x1 = w >> 1;
  const y1 = h >> 1;
  const x0 = -x1;
  const y0 = -y1;

  return toPlacingSprite(d, xoff, yoff, initialX, initialY, x1, y1, x0, y0);
}

// Reads back pixels and computes the bitmask sprite into d.sprite
function extractSpriteBitmask(
  d: PlacingSprite,
  contextAndRatio: CanvasContextAndRatio,
  cw: number,
  ch: number
): PlacingSprite {
  const c = contextAndRatio.context;
  const ratio = contextAndRatio.ratio;
  const pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data;

  const w1 = d.width;
  const w32 = w1 >> 5;
  let h1 = d.y1! - d.y0!;
  const sprite: number[] = new Array(h1 * w32).fill(0);

  let x = d.xoff!;
  let y = d.yoff!;
  let seen = 0;
  let seenRow = -1;

  for (let j = 0; j < h1; j++) {
    for (let i = 0; i < w1; i++) {
      const k = w32 * j + (i >> 5);
      const m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
      sprite[k] |= m;
      seen |= m;
    }
    if (seen) {
      seenRow = j;
    } else {
      d.y0!++;
      h1--;
      j--;
      y++;
    }
  }
  d.y1 = d.y0! + seenRow;
  d.sprite = sprite.slice(0, (d.y1 - d.y0!) * w32);

  return d;
}

export function generateWordSprites(
  d: SizedSprite,
  contextAndRatio: CanvasContextAndRatio,
  cw: number,
  ch: number,
  cloudRadians: number,
  size: Size
): PlacingSprite {
  const p = renderSingleWord(d, contextAndRatio, cw, ch, cloudRadians, size);
  return extractSpriteBitmask(p, contextAndRatio, cw, ch);
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
