import { PlacingSprite, Size, Sprite, isPlacedSprite } from './types';

/**
 * Calculates the transform attribute for SVG scaling
 */
export function calculateTransform(size: Size, scaleFactor: number): string {
  const visualScale = 1 / scaleFactor;
  return `translate(${[size.width >> 1, size.height >> 1]}) scale(${visualScale})`;
}

/**
 * Calculates scaled board dimensions
 */
export function calculateScaledBoardSize(size: Size, scaleFactor: number): { width: number; height: number } {
  return {
    width: Math.ceil(size.width * scaleFactor),
    height: Math.ceil(size.height * scaleFactor),
  };
}

/**
 * Determines if retry is needed and calculates new scale factor
 */
export function shouldRetryWithScaling(unplacedWordsCount: number, currentRetry: number, maxRetries: number): boolean {
  return unplacedWordsCount > 0 && currentRetry < maxRetries;
}

/**
 * Calculates the next scale factor for retry
 */
export function calculateNextScaleFactor(currentScaleFactor: number, scaleIncrement: number): number {
  return currentScaleFactor + scaleIncrement;
}

/**
 * Resets word placement state for retry by converting placed sprites back to placing sprites
 */
export function resetWordPlacementState(words: Sprite[]): void {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (isPlacedSprite(word)) {
      // Convert placed sprite back to placing sprite for retry
      words[i] = {
        ...word,
        placed: false,
        x: 0,
        y: 0,
      } as PlacingSprite;
    }
  }
}
