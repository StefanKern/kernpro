import { placeWord, updateCloudBounds } from './wordcloud-layout.functions';
import { PlacingSprite, PlacedSprite, UnplaceableSprite, Size, isPlacedSprite, isUnplaceableSprite } from './types';

function makePlacingSprite(overrides: Partial<PlacingSprite> = {}): PlacingSprite {
  // Minimal 1-row sprite with width 32px (w32=1), height=1
  const base: PlacingSprite = {
    text: 'X',
    size: 'medium' as any,
    color: '#000',
    font: 'serif',
    style: 'normal',
    weight: 'normal',
    rotate: 0,
    padding: 0,
    visualSize: 20,
    xoff: 0,
    yoff: 0,
    x0: 0,
    y0: 0,
    x1: 32,
    y1: 1,
    width: 32,
    height: 1,
    sprite: [0b1],
  };
  return { ...base, ...overrides };
}

describe('updateCloudBounds', () => {
  it('expands bounds to include the positioned box', () => {
    const bounds: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ];
    const d = { x: 5, y: 6, x0: -4, y0: -3, x1: 15, y1: 14 } as const;
    updateCloudBounds(bounds as any, d as any);
    expect(bounds[0]).toEqual({ x: 1, y: 3 }); // min updated
    expect(bounds[1]).toEqual({ x: 20, y: 20 }); // x1+y1 still within

    // Now a box exceeding the current max
    const e = { x: 30, y: 40, x0: -2, y0: -5, x1: 4, y1: 8 } as const;
    updateCloudBounds(bounds as any, e as any);
    expect(bounds[0]).toEqual({ x: 1, y: 3 });
    expect(bounds[1]).toEqual({ x: 34, y: 48 }); // max extended
  });
});

describe('placeWord', () => {
  const size: Size = { width: 64, height: 32 };

  beforeEach(() => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // initialX
      .mockReturnValueOnce(0) // initialY
      .mockReturnValueOnce(0); // dt positive
  });

  afterEach(() => {
    (Math.random as jest.Mock).mockRestore();
  });

  it('places a simple sprite when board is empty (no bounds)', () => {
    const d = makePlacingSprite();
    const board = new Int32Array((size.width >> 5) * size.height);
    const res = placeWord(d, board, undefined, size);
    expect(isPlacedSprite(res)).toBe(true);
    const placed = res as PlacedSprite;

    // Within centered coordinate system
    const halfX = size.width >> 1;
    const halfY = size.height >> 1;
    expect(placed.x + placed.x0).toBeGreaterThanOrEqual(-halfX);
    expect(placed.x + placed.x1).toBeLessThanOrEqual(halfX);
    expect(placed.y + placed.y0).toBeGreaterThanOrEqual(-halfY);
    expect(placed.y + placed.y1).toBeLessThanOrEqual(halfY);

    // Board should record some occupancy
    expect(board.some((v) => v !== 0)).toBe(true);
  });

  it('returns UnplaceableSprite when collision always occurs (bounds present)', () => {
    const d = makePlacingSprite();
    const board = new Int32Array((size.width >> 5) * size.height);
    // Fill board to force collision on any candidate
    board.fill(-1);
    const bounds: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: -10, y: -10 },
      { x: 10, y: 10 },
    ];
    const res = placeWord(d, board, bounds as any, size);
    expect(isUnplaceableSprite(res)).toBe(true);
  });

  it('keeps placed coordinates consistent with sprite extents', () => {
    const d = makePlacingSprite({ x0: -8, x1: 24, y0: -1, y1: 0 });
    const board = new Int32Array((size.width >> 5) * size.height);
    const res = placeWord(d, board, undefined, size) as PlacedSprite | UnplaceableSprite;
    expect(isPlacedSprite(res)).toBe(true);
    const p = res as PlacedSprite;
    // extents relative to center must fit
    const halfX = size.width >> 1;
    const halfY = size.height >> 1;
    expect(p.x + p.x0).toBeGreaterThanOrEqual(-halfX);
    expect(p.x + p.x1).toBeLessThanOrEqual(halfX);
    expect(p.y + p.y0).toBeGreaterThanOrEqual(-halfY);
    expect(p.y + p.y1).toBeLessThanOrEqual(halfY);
  });
});
