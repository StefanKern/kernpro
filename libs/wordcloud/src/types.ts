export type WordcloudWordSize = 'small' | 'medium' | 'large' | 'extra-large' | 'huge';

export type WordcloudWord = {
  text: string;
  size: WordcloudWordSize;
  color?: string;
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

// Base sprite properties shared by all states
type BaseSpriteProperties = Readonly<WordcloudWord> & {
  readonly font: string;
  readonly style: string;
  readonly weight: string;
  rotate: number;
  padding: number;
  visualSize: number; // Visual size calculated from size
};

// Sprite before placement attempt
export type UnplacedSprite = BaseSpriteProperties & {
  placed: false;
  hasText: false;
  sprite?: undefined;
  width?: undefined;
  height?: undefined;
  xoff?: undefined;
  yoff?: undefined;
  x?: undefined;
  y?: undefined;
  x1?: undefined;
  y1?: undefined;
  x0?: undefined;
  y0?: undefined;
};

// Sprite during placement process (has sprite data but no final position)
export type PlacingSprite = BaseSpriteProperties & {
  placed: false;
  hasText: true;
  sprite?: number[];
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
};

// Successfully placed sprite
export type PlacedSprite = BaseSpriteProperties & {
  placed: true;
  hasText: true;
  sprite?: number[];
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
};

// Union type for all sprite states
export type Sprite = UnplacedSprite | PlacingSprite | PlacedSprite;

// Type guards
export function isPlacedSprite(sprite: Sprite): sprite is PlacedSprite {
  return sprite.placed === true;
}

export function isUnplacedSprite(sprite: Sprite): sprite is UnplacedSprite {
  return sprite.placed === false && sprite.hasText === false;
}

export function isPlacingSprite(sprite: Sprite): sprite is PlacingSprite {
  return sprite.placed === false && sprite.hasText === true;
}

// Helper functions for creating sprites in different states
export function createUnplacedSprite(word: WordcloudWord): UnplacedSprite {
  return {
    ...word,
    font: 'serif',
    style: 'normal',
    weight: 'normal',
    rotate: Math.random() * 40 - 20, // -20 to +20 degrees
    padding: 3,
    visualSize: 0, // Will be calculated
    placed: false,
    hasText: false,
  };
}

export function createPlacingSprite(unplaced: UnplacedSprite, visualSize: number): PlacingSprite {
  return {
    ...unplaced,
    visualSize,
    hasText: true,
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
  };
}

export function createPlacedSprite(placing: PlacingSprite): PlacedSprite {
  return {
    ...placing,
    placed: true,
  };
}
