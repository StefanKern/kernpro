import { getVisualSize } from './wordcloud-canvas.functions';

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
