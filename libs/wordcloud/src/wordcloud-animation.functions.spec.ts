import {
  animateElementRemoval,
  animateElementEntrance,
  animateElementUpdate,
  animateWordsOut,
  createWordElement,
} from './wordcloud-animation.functions';
import type { PlacedSprite } from './types';

describe('wordcloud-animation.functions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function makeWord(overrides: Partial<PlacedSprite> = {}): PlacedSprite {
    const base: any = {
      text: 'Hello',
      visualSize: 24,
      rotate: 15,
      x: 10,
      y: 20,
      color: '#123456',
    };
    return { ...(base as any), ...(overrides as any) } as PlacedSprite;
  }

  function svgText(): SVGTextElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'text');
  }

  function svgGroup(): SVGGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'g');
  }

  describe('animateElementRemoval', () => {
    it('applies exit styles and removes element after timeout', () => {
      const parent = svgGroup();
      const text = svgText();
      parent.appendChild(text);

      animateElementRemoval(text);

      // Immediately applied styles
      expect(text.style.transition).toContain('opacity');
      expect(text.style.opacity).toBe('0');
      expect(text.style.transform).toContain('scale(0.1)');

      // Fast-forward time for removal
      jest.advanceTimersByTime(1000);
      expect(text.parentNode).toBeNull();
    });
  });

  describe('animateElementEntrance', () => {
    it('sets initial styles, then transitions to final styles after 50ms', () => {
      const text = svgText();
      const word = makeWord({ text: 'Angular', visualSize: 30, rotate: 20, x: 100, y: 50, color: '#ff0000' });

      // jsdom may not have getBoundingClientRect; define a noop
      (text as any).getBoundingClientRect = jest.fn(() => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
      }));

      animateElementEntrance(text, word);

      // Initial state
      expect(text.style.opacity).toBe('0');
      expect(text.style.fontSize).toBe('1px');
      expect(text.style.transform).toBe('translate(0, 0) rotate(0)');
      expect(text.textContent).toBe('');
      expect(text.style.fill).toBe('#ff0000');

      jest.advanceTimersByTime(50);

      // Final state after timeout
      expect(text.style.transition).toContain('opacity');
      expect(text.style.opacity).toBe('1');
      expect(text.style.fontSize).toBe('30px');
      expect(text.style.transform).toBe('translate(100px, 50px) rotate(20deg)');
      expect(text.textContent).toBe('Angular');
    });
  });

  describe('animateElementUpdate', () => {
    it('applies transition, transform, fontSize, fill, and text content immediately', () => {
      const text = svgText();
      const word = makeWord({ text: 'Update', visualSize: 18, rotate: 5, x: 7, y: 9, color: '#00ff00' });

      animateElementUpdate(text, word);

      expect(text.style.transition).toContain('transform');
      expect(text.style.transform).toBe('translate(7px, 9px) rotate(5deg)');
      expect(text.style.fontSize).toBe('18px');
      expect(text.style.fill).toBe('#00ff00');
      expect(text.textContent).toBe('Update');
    });
  });

  describe('animateWordsOut', () => {
    it('animates out all .kp-wordcloud texts and removes them after 500ms', async () => {
      const vis = svgGroup();
      const t1 = svgText();
      t1.setAttribute('class', 'kp-wordcloud');
      const t2 = svgText();
      t2.setAttribute('class', 'kp-wordcloud');
      vis.appendChild(t1);
      vis.appendChild(t2);

      const promise = animateWordsOut(vis);

      // Styles should be applied immediately
      [t1, t2].forEach((t) => {
        expect(t.style.transition).toContain('opacity 0.5s');
        expect(t.style.opacity).toBe('0');
        expect(t.style.transform).toContain('scale(0.1)');
      });

      // Advance timers and await promise
      jest.advanceTimersByTime(500);
      await promise;

      expect(vis.querySelectorAll('text.kp-wordcloud').length).toBe(0);
    });

    it('resolves immediately when there are no words', async () => {
      const vis = svgGroup();
      await expect(animateWordsOut(vis)).resolves.toBeUndefined();
    });
  });

  describe('createWordElement', () => {
    it('creates an SVG text element with expected attributes and click behavior', () => {
      const word = makeWord({ text: 'ClickMe' });
      const cb = jest.fn();
      const el = createWordElement(word, cb);

      expect(el.tagName.toLowerCase()).toBe('text');
      expect(el.getAttribute('text-anchor')).toBe('middle');
      expect(el.getAttribute('class')).toBe('kp-wordcloud');
      expect(el.style.pointerEvents).toBe('visible');
      expect(el.style.cursor).toBe('pointer');

      el.dispatchEvent(new Event('click'));
      expect(cb).toHaveBeenCalledWith('ClickMe');
    });
  });
});
