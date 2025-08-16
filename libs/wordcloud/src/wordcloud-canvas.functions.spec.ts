import { getVisualSize, createCanvasContext, generateWordSprites } from './wordcloud-canvas.functions';
import { SizedSprite, isUnplaceableSprite } from './types';

describe('getVisualSize', () => {
  it('maps known sizes to pixels', () => {
    expect(getVisualSize('small')).toBe(12);
    expect(getVisualSize('medium')).toBe(22);
    expect(getVisualSize('large')).toBe(30);
    expect(getVisualSize('extra-large')).toBe(45);
    expect(getVisualSize('huge')).toBe(65);
  });

  it('falls back to medium size (22) for unknown labels', () => {
    expect(getVisualSize('unknown-size')).toBe(22);
  });
});

describe('createCanvasContext', () => {
  it('throws when getContext returns null', () => {
    const fakeCanvas = {
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    expect(() => createCanvasContext(fakeCanvas, 10, 5)).toThrow('Unable to get 2D canvas context');
  });

  it('configures canvas size and styles with ratio = 1', () => {
    // Arrange: ratio = sqrt((4 >> 2)) = sqrt(1) = 1
    const ctx: any = {
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      fillStyle: 'black',
      strokeStyle: 'black',
      textAlign: 'left',
    };
    const fakeCanvas: any = {
      width: 0,
      height: 0,
      getContext: () => ctx,
    } as unknown as HTMLCanvasElement;

    // Act
    const result = createCanvasContext(fakeCanvas, 2, 3);

    // Assert
    expect(result.context).toBe(ctx);
    expect(result.ratio).toBe(1);
    // width = (cw << 5) / ratio = 2*32 / 1 = 64; height = ch / ratio = 3 / 1 = 3
    expect((fakeCanvas as any).width).toBe(64);
    expect((fakeCanvas as any).height).toBe(3);
    expect(ctx.fillStyle).toBe('red');
    expect(ctx.strokeStyle).toBe('red');
    expect(ctx.textAlign).toBe('center');
  });

  it('uses computed ratio from imageData length to scale width/height', () => {
    // Arrange: data length 16 -> 16 >> 2 = 4 -> sqrt(4) = 2
    const ctx: any = {
      getImageData: () => ({ data: new Uint8ClampedArray(16) }),
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
    };
    const fakeCanvas: any = {
      width: 0,
      height: 0,
      getContext: () => ctx,
    } as unknown as HTMLCanvasElement;

    const r = createCanvasContext(fakeCanvas, 4, 8);
    expect(r.ratio).toBe(2);
    // width = (4 << 5)/2 = (128)/2 = 64
    expect((fakeCanvas as any).width).toBe(64);
    // height = 8/2 = 4
    expect((fakeCanvas as any).height).toBe(4);
  });
});

describe('generateWordSprites (covers internal renderSingleWord and extractSpriteBitmask)', () => {
  const rad = Math.PI / 180;

  function makeCtxWithPixels(pixelDataLength: number, measureWidth: number) {
    const dataArr = new Uint8ClampedArray(pixelDataLength);
    // Fill with non-zero so every pixel is considered painted
    dataArr.fill(255);
    const ctx: any = {
      getImageData: () => ({ data: dataArr }),
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: measureWidth }),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
    };
    return ctx;
  }

  function makeCtxWithTransparentTopRows(cw: number, ch: number, transparentRows: number, measureWidth: number) {
    const totalPixels = (cw << 5) * ch;
    const dataArr = new Uint8ClampedArray(totalPixels * 4);
    // Set opaque (255) everywhere first
    for (let i = 0; i < totalPixels; i++) {
      dataArr[i * 4] = 255; // red channel used by code
    }
    // Then zero-out the top 'transparentRows' rows
    for (let row = 0; row < transparentRows; row++) {
      for (let col = 0; col < cw << 5; col++) {
        const idx = (row * (cw << 5) + col) * 4;
        dataArr[idx] = 0;
      }
    }
    const calls: any[] = [];
    const ctx: any = {
      getImageData: () => ({ data: dataArr }),
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillText: () => {},
      strokeText: (...args: any[]) => calls.push(['strokeText', ...args]),
      measureText: () => ({ width: measureWidth }),
      set lineWidth(v: number) {
        calls.push(['lineWidth', v]);
      },
      get lineWidth() {
        return undefined;
      },
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      _calls: calls,
    };
    return ctx;
  }

  it('returns UnplaceableSprite when the rendered height exceeds the sheet (indirectly testing renderSingleWord)', () => {
    // Sized sprite with rotate=0 for deterministic math, visualSize => height = visualSize << 1
    const sized: SizedSprite = {
      text: 'Big',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20, // h = 40
    };

    const ctx = makeCtxWithPixels(4, /*measureWidth*/ 40);
    const contextAndRatio = { context: ctx as any, ratio: 1 };

    // ch is too small (e.g., 30 < h 40) so y + h >= ch => unplaceable
    const res = generateWordSprites(sized, contextAndRatio, /*cw*/ 4, /*ch*/ 30, rad);
    expect(isUnplaceableSprite(res)).toBe(true);
  });

  it('produces a PlacingSprite with expected width/height and sprite length (indirectly testing extractSpriteBitmask)', () => {
    const sized: SizedSprite = {
      text: 'Ok',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20, // h = 40
    };

    const ctx = makeCtxWithPixels(1024 * 4, /*measureWidth*/ 40);
    const contextAndRatio = { context: ctx as any, ratio: 1 };

    // Choose cw big enough to fit width; with measureWidth 40 and rotate=0:
    // width becomes rounded to multiple of 32: ((40 + 31) >> 5) << 5 = 64
    const cw = 4; // 4 << 5 = 128 >= 64 OK
    const ch = 100; // > h (40)

    const res = generateWordSprites(sized, contextAndRatio, cw, ch, rad);
    expect(isUnplaceableSprite(res)).toBe(false);

    const placing = res as any;
    expect(placing.width).toBe(64);
    expect(placing.height).toBe(40);

    // After extractSpriteBitmask with all pixels set, seenRow = h-1, so
    // y1 - y0 becomes (h - 1). Sprite length = (y1 - y0) * (width >> 5)
    const w32 = placing.width >> 5; // 64 >> 5 = 2
    expect(Array.isArray(placing.sprite)).toBe(true);
    expect(placing.sprite.length).toBe((placing.height - 1) * w32);
  });

  it('rotation increases bounding width/height vs rotate=0', () => {
    const base: SizedSprite = {
      text: 'Rotate',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20,
    };
    const ctx = makeCtxWithPixels(4096, 40);
    const c = { context: ctx as any, ratio: 1 };
    const cw = 6; // 192 width
    const ch = 200;
    const noRot = generateWordSprites(base, c, cw, ch, rad) as any;

    const rotated = generateWordSprites({ ...base, rotate: 20 }, c, cw, ch, rad) as any;
    expect(rotated.width).toBeGreaterThanOrEqual(noRot.width);
    expect(rotated.height).toBeGreaterThanOrEqual(noRot.height);
  });

  it('becomes unplaceable when width forces wrap and ch is too small for second row', () => {
    const sized: SizedSprite = {
      text: 'Wide',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20,
    };
    // Force width >= cw<<5 by making cw small and measure width large
    const ctx = makeCtxWithPixels(1024, 300);
    const c = { context: ctx as any, ratio: 1 };
    const cw = 2; // 64 width available
    const h = 40;
    const ch = h; // second row would overflow -> unplaceable
    const res = generateWordSprites(sized, c, cw, ch, rad);
    expect(isUnplaceableSprite(res)).toBe(true);
  });

  it('wraps to next row and remains placeable when ch is large enough; yoff reflects wrap', () => {
    const sized: SizedSprite = {
      text: 'Wrap',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20,
    };
    const ctx = makeCtxWithPixels(4096, 300);
    const c = { context: ctx as any, ratio: 1 };
    const cw = 2; // 64 available, w will exceed -> wrap
    const h = 40;
    const ch = h * 3; // enough for two rows
    const res = generateWordSprites(sized, c, cw, ch, rad) as any;
    expect(isUnplaceableSprite(res)).toBe(false);
    expect(res.yoff).toBe(h); // moved to next row
    expect(res.xoff).toBe(0);
  });

  it('respects ratio != 1 when measuring width (ratio=2 => width rounding based on doubled measure)', () => {
    const sized: SizedSprite = {
      text: 'Ratio',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20,
    };
    const ctx = makeCtxWithPixels(16, 40); // imageData len=16 -> ratio = sqrt(16>>2)=sqrt(4)=2
    const c = { context: ctx as any, ratio: 2 };
    const cw = 4; // 128 width available
    const ch = 100;
    const res = generateWordSprites(sized, c, cw, ch, rad) as any;
    // expected w = ((40*2 + 31)>>5)<<5 = 96
    expect(res.width).toBe(96);
  });

  it('invokes strokeText and sets lineWidth when padding > 0', () => {
    const sized: SizedSprite = {
      text: 'Pad',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 2,
      visualSize: 20,
    };
    const cw = 4;
    const ch = 100;
    const ctx: any = makeCtxWithTransparentTopRows(cw, ch, 0, 40);
    const c = { context: ctx as any, ratio: 1 };
    const res = generateWordSprites(sized, c, cw, ch, rad) as any;
    expect(isUnplaceableSprite(res)).toBe(false);
    const calls = (ctx as any)._calls as any[];
    // Expect lineWidth set to 2*padding and strokeText called at least once
    expect(calls.some((c) => c[0] === 'lineWidth' && c[1] === 4)).toBe(true);
    expect(calls.some((c) => c[0] === 'strokeText')).toBe(true);
  });

  it('trims transparent top rows in sprite (y0 increases, sprite length shrinks)', () => {
    const sized: SizedSprite = {
      text: 'Trim',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20, // h=40
    };
    const cw = 4; // canvas width 128
    const ch = 100;
    const transparentRows = 5;
    const ctx: any = makeCtxWithTransparentTopRows(cw, ch, transparentRows, 40);
    const c = { context: ctx as any, ratio: 1 };
    const res = generateWordSprites(sized, c, cw, ch, rad) as any;
    expect(isUnplaceableSprite(res)).toBe(false);
    const w32 = res.width >> 5;
    // Original h = 40 -> expected trimmed sprite rows ~ 39 (since seenRow = h-1), minus transparentRows
    expect(res.sprite.length).toBe((res.height - 1 - transparentRows) * w32);
  });

  it('handles empty text by still measuring using the appended "m" and producing reasonable width', () => {
    const sized: SizedSprite = {
      text: '',
      size: 'medium' as any,
      color: '#000',
      font: 'serif',
      style: 'normal',
      weight: 'normal',
      rotate: 0,
      padding: 0,
      visualSize: 20,
    };
    const ctx = makeCtxWithPixels(4096, 40); // measure('' + 'm') -> 40
    const c = { context: ctx as any, ratio: 1 };
    const res = generateWordSprites(sized, c, 4, 100, rad) as any;
    expect(isUnplaceableSprite(res)).toBe(false);
    expect(res.width).toBeGreaterThan(0);
    expect(res.height).toBe(40);
  });
});
