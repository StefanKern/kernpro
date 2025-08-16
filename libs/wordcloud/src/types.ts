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

// Sprite after visual size is computed, but before any canvas metrics exist
export type SizedSprite = Readonly<WordcloudWord> & {
  readonly font: string;
  readonly style: string;
  readonly weight: string;
  rotate: number;
  padding: number;
  visualSize: number;
};

export type PlacingSpriteSpecificValues = {
  xoff: number;
  yoff: number;
  x1: number;
  y1: number;
  x0: number;
  y0: number;
  width: number;
  height: number;
};

// Sprite during placement process (has sprite data but no final position)
export type PlacingSprite = SizedSprite & {
  sprite?: number[];
} & PlacingSpriteSpecificValues;

export type PlacedSpriteSpecificValues = {
  x: number;
  y: number;
};

// Successfully placed sprite
export type PlacedSprite = PlacingSprite & {} & PlacedSpriteSpecificValues;

// Sprite that cannot be placed (e.g., too large to fit). Derived from SizedSprite shape.
export type UnplaceableSprite = SizedSprite & {
  status: 'unplaceable';
};

// Union type for all sprite states
export type Sprite = SizedSprite | PlacingSprite | PlacedSprite | UnplaceableSprite;

export function isPlacingSprite(sprite: Sprite): sprite is PlacingSprite {
  const required = ['xoff', 'yoff', 'x1', 'y1', 'x0', 'y0', 'width', 'height'] as const;
  return required.every((k) => typeof (sprite as any)[k] === 'number');
}
export function isPlacedSprite(sprite: Sprite): sprite is PlacedSprite {
  const required = ['x', 'y'] as const;
  return required.every((k) => typeof (sprite as any)[k] === 'number');
}
export function isUnplaceableSprite(sprite: Sprite): sprite is UnplaceableSprite {
  return (sprite as UnplaceableSprite).status === 'unplaceable';
}

export function createSizedSprite(word: WordcloudWord, visualSize: number): SizedSprite {
  return {
    ...word,
    font: 'serif',
    style: 'normal',
    weight: 'normal',
    rotate: Math.random() * 40 - 20, // -20 to +20 degrees
    padding: 3,
    visualSize,
  };
}

export function toPlacingSprite(placing: SizedSprite, init: PlacingSpriteSpecificValues): PlacingSprite {
  // In-place transform to PlacingSprite using object assign (avoids double-cast)
  const converted = Object.assign(placing, {
    placed: false as const,
    sprite: undefined as number[] | undefined,
    ...init,
  });
  return converted satisfies PlacingSprite;
}

export function toPlacedSprite(placing: PlacingSprite, init: PlacedSpriteSpecificValues): PlacedSprite {
  // In-place transform from PlacingSprite to PlacedSprite with a single assertion
  const converted = Object.assign(placing, {
    placed: true as const,
    ...init,
  });
  return converted satisfies PlacedSprite;
}
