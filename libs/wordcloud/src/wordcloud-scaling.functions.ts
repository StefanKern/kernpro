/**
 * Calculates the transform attribute for SVG scaling
 */
export function calculateTransform(
  size: number[],
  scaleFactor: number
): string {
  const visualScale = 1 / scaleFactor;
  return `translate(${[size[0] >> 1, size[1] >> 1]}) scale(${visualScale})`;
}

/**
 * Calculates scaled board dimensions
 */
export function calculateScaledBoardSize(
  size: number[],
  scaleFactor: number
): { width: number; height: number } {
  return {
    width: Math.ceil(size[0] * scaleFactor),
    height: Math.ceil(size[1] * scaleFactor),
  };
}

/**
 * Determines if retry is needed and calculates new scale factor
 */
export function shouldRetryWithScaling(
  unplacedWordsCount: number,
  currentRetry: number,
  maxRetries: number
): boolean {
  return unplacedWordsCount > 0 && currentRetry < maxRetries;
}

/**
 * Calculates the next scale factor for retry
 */
export function calculateNextScaleFactor(
  currentScaleFactor: number,
  scaleIncrement: number
): number {
  return currentScaleFactor + scaleIncrement;
}

/**
 * Resets word placement state for retry
 */
export function resetWordPlacementState(words: any[]): void {
  words.forEach((word) => {
    word.placed = false;
    word.x = 0;
    word.y = 0;
  });
}

/**
 * Calculates initial random position for a word within scaled bounds
 */
export function calculateInitialPosition(
  size: number[],
  scaleFactor: number
): { x: number; y: number } {
  const scaledSizeX = size[0] * scaleFactor;
  const scaledSizeY = size[1] * scaleFactor;

  let x = (scaledSizeX * (Math.random() + 0.5)) >> 1;
  let y = (scaledSizeY * (Math.random() + 0.5)) >> 1;

  // Adjust coordinates to center based on scaled size
  x -= scaledSizeX >> 1;
  y -= scaledSizeY >> 1;

  return { x, y };
}
