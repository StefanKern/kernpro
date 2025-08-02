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

export type Sprite = Readonly<WordcloudWord> & {
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
