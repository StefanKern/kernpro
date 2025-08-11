import { Point, Tag, PositionedBoundingBox, Size } from './types';

/**
 * Creates an Archimedean spiral function for word positioning
 */
export function createArchimedeanSpiral(size: Size) {
  const e = size.width / size.height;
  return function (t: number) {
    return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
  };
}

/**
 * Checks for collision between a word and the board
 */
export function checkCloudCollision(tag: Tag, board: Int32Array, width: number, size: Size): boolean {
  const halfWidth = width >> 1;
  let sw = width >> 5; // convert to number of 32-bit ints per row
  const sprite = tag.sprite,
    w = tag.width >> 5,
    // Adjust collision coordinates to account for centered system
    lx = tag.x + halfWidth - (w << 4),
    sx = lx & 0x7f,
    msx = 32 - sx,
    h = tag.y1 - tag.y0;
  let x = (tag.y + (size.height >> 1) + tag.y0) * sw + (lx >> 5),
    last;
  for (let j = 0; j < h; j++) {
    last = 0;
    for (let i = 0; i <= w; i++) {
      if (((last << msx) | (i < w ? (last = sprite![j * w + i]) >>> sx : 0)) & board[x + i]) {
        return true;
      }
    }
    x += sw;
  }
  return false;
}

/**
 * Updates the bounds based on a positioned word
 */
export function updateCloudBounds(bounds: Point[], d: PositionedBoundingBox): void {
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

/**
 * Checks if two rectangles collide
 */
export function checkRectCollision(a: PositionedBoundingBox, b: Point[]): boolean {
  return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
}

/**
 * Attempts to place a word on the board using spiral positioning
 */
export function placeWord(board: Int32Array, tag: Tag, bounds: Point[] | undefined, text: string, size: Size): boolean {
  const startX = tag.x;
  const startY = tag.y;
  const maxDelta = Math.sqrt(size.width * size.width + size.height * size.height);
  const spiralFn = createArchimedeanSpiral(size);
  const dt = Math.random() < 0.5 ? 1 : -1;
  let t = -dt;
  let dxdy;
  let dx;
  let dy;

  while ((dxdy = spiralFn((t += dt)))) {
    dx = ~~dxdy[0];
    dy = ~~dxdy[1];

    const actualDistance = Math.sqrt(dx * dx + dy * dy);
    if (actualDistance >= maxDelta) break; // give up for this word

    tag.x = startX + dx;
    tag.y = startY + dy;

    const scaledSizeX = size.width;
    const scaledSizeY = size.height;
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

    // Check for collisions
    if (!bounds || !checkCloudCollision(tag, board, scaledSizeX, size)) {
      if (!bounds || checkRectCollision(tag, bounds)) {
        markBoardSpace(tag, board, scaledSizeX, size);
        return true;
      }
    }
  }
  return false;
}

/**
 * Marks the space occupied by a word on the collision board
 */
function markBoardSpace(tag: Tag, board: Int32Array, width: number, size: Size): void {
  const sprite = tag.sprite,
    w = tag.width >> 5,
    sw = width >> 5,
    halfScaledX = width >> 1,
    halfScaledY = size.height >> 1,
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
      board[x + i] |= (last << msx) | (i < w ? (last = sprite![j * w + i]) >>> sx : 0);
    }
    x += sw;
  }
  delete tag.sprite;
}
