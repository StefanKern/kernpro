export type WordcloudWordSize = 'small' | 'medium' | 'large' | 'extra-large' | 'huge';

export type WordcloudWord = {
  text: string;
  size: WordcloudWordSize;
  color?: string;
};

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  x0: number; // Left edge
  x1: number; // Right edge
  y0: number; // Top edge
  y1: number; // Bottom edge
};

export type PositionedBoundingBox = Point & BoundingBox;

export type Tag = PositionedBoundingBox & {
  sprite?: number[];
  width: number;
};

// Canvas context and ratio for wordcloud rendering
export interface CanvasContextAndRatio {
  context: CanvasRenderingContext2D;
  ratio: number;
}

// Base sprite properties shared by all states
export type SpriteStatus = 'sized' | 'placing' | 'placed' | 'unplaceable';

type BaseSpriteProperties = Readonly<WordcloudWord> & {
  readonly font: string;
  readonly style: string;
  readonly weight: string;
  rotate: number;
  padding: number;
  visualSize: number; // Visual size calculated from size
  status: SpriteStatus; // tracks transformation state
};

// Sprite after visual size is computed, but before any canvas metrics exist
export type SizedSprite = Omit<BaseSpriteProperties, 'status'> & {
  status: 'sized';
  placed: false;
  hasText: false;
  width: number;
  height: number;
};

// Sprite during placement process (has sprite data but no final position)
export type PlacingSprite = Omit<SizedSprite, 'status' | 'hasText'> & {
  status: 'placing';
  placed: false;
  hasText: true;
  sprite?: number[];
  xoff: number;
  yoff: number;
  x: number;
  y: number;
  x1: number;
  y1: number;
  x0: number;
  y0: number;
};

// Successfully placed sprite
export type PlacedSprite = Omit<PlacingSprite, 'status' | 'placed'> & {
  status: 'placed';
  placed: true;
  hasText: true;
};

// Sprite that cannot be placed (e.g., too large to fit). Derived from SizedSprite shape.
export type UnplaceableSprite = Omit<SizedSprite, 'status'> & {
  status: 'unplaceable';
};

// Union type for all sprite states
export type Sprite = SizedSprite | PlacingSprite | PlacedSprite | UnplaceableSprite;

// Type guards
export function isSizedSprite(sprite: Sprite): sprite is SizedSprite {
  return sprite.status === 'sized';
}
export function isPlacingSprite(sprite: Sprite): sprite is PlacingSprite {
  return sprite.status === 'placing';
}
export function isPlacedSprite(sprite: Sprite): sprite is PlacedSprite {
  return sprite.status === 'placed';
}
export function isUnplaceableSprite(sprite: Sprite): sprite is UnplaceableSprite {
  return sprite.status === 'unplaceable';
}

export function createSizedSprite(word: WordcloudWord, visualSize: number, width: number, height: number): SizedSprite {
  return {
    ...word,
    font: 'serif',
    style: 'normal',
    weight: 'normal',
    rotate: Math.random() * 40 - 20, // -20 to +20 degrees
    padding: 3,
    visualSize,
    placed: false,
    hasText: false,
    status: 'sized',
    width,
    height,
  };
}

export function toPlacingSprite(
  placing: SizedSprite,
  xoff: number,
  yoff: number,
  x: number,
  y: number,
  x1: number,
  y1: number,
  x0: number,
  y0: number
): PlacingSprite {
  // Convert the incoming SizedSprite into a PlacingSprite in-place to avoid copying
  const converted = placing as unknown as PlacingSprite;
  converted.status = 'placing';
  converted.placed = false;
  converted.hasText = true;
  converted.sprite = undefined;
  converted.xoff = xoff;
  converted.yoff = yoff;
  converted.x = x;
  converted.y = y;
  converted.x1 = x1;
  converted.y1 = y1;
  converted.x0 = x0;
  converted.y0 = y0;
  return converted;
}

export function toPlacedSprite(placing: PlacingSprite): PlacedSprite {
  // Convert the incoming PlacingSprite into a PlacedSprite in-place to avoid copying
  const converted = placing as unknown as PlacedSprite;
  converted.status = 'placed';
  converted.placed = true;
  converted.hasText = true;
  return converted;
}
