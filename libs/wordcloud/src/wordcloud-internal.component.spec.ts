import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { WordcloudComponentInternal } from './wordcloud-internal.component';
import type { WordcloudWord } from './types';

// Mock heavy modules used by the component
jest.mock('./wordcloud-canvas.functions', () => ({
  createCanvasContext: jest.fn(() => ({
    context: {
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 40 })),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      lineWidth: 0,
    },
    ratio: 1,
  })),
  getVisualSize: jest.fn(
    (size: string) =>
      ({
        small: 12,
        medium: 22,
        large: 30,
        'extra-large': 45,
        huge: 65,
      }[size] ?? 22)
  ),
  generateWordSprites: jest.fn((sized: any) => ({
    ...sized,
    xoff: 0,
    yoff: 0,
    x1: 10,
    y1: 20,
    x0: -10,
    y0: -20,
    width: 32,
    height: 40,
    sprite: [1, 1],
  })),
}));

jest.mock('./wordcloud-layout.functions', () => ({
  placeWord: jest.fn((placing: any) => ({ ...placing, x: 5, y: 6 })),
  updateCloudBounds: jest.fn(),
}));

jest.mock('./wordcloud-animation.functions', () => ({
  animateElementEntrance: jest.fn(),
  animateElementRemoval: jest.fn(),
  animateElementUpdate: jest.fn(),
  animateWordsOut: jest.fn(() => Promise.resolve()),
  createWordElement: jest.fn((word: any, cb: (text: string) => void) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('class', 'kp-wordcloud');
    el.addEventListener('click', () => cb(word.text));
    return el as unknown as SVGTextElement;
  }),
}));

import { animateWordsOut } from './wordcloud-animation.functions';

// Simple RAF shim using timers
beforeEach(() => {
  jest.useFakeTimers();
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as any;
  (globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

function create(words: WordcloudWord[], platform: 'browser' | 'server' = 'browser') {
  TestBed.configureTestingModule({
    imports: [WordcloudComponentInternal],
    providers: [{ provide: PLATFORM_ID, useValue: platform }],
  });
  const fixture = TestBed.createComponent(WordcloudComponentInternal);
  const comp = fixture.componentInstance;
  comp.size = { width: 320, height: 180 };
  comp.words = words;
  return { fixture, comp };
}

describe('WordcloudComponentInternal', () => {
  it('emits layoutStarted and layoutComplete and renders words', async () => {
    const words: WordcloudWord[] = [
      { text: 'Angular', size: 'large' as any },
      { text: 'TypeScript', size: 'medium' as any },
    ];
    const { fixture, comp } = create(words);

    const started = jest.fn();
    const completed = jest.fn();
    comp.layoutStarted.subscribe(started);
    comp.layoutComplete.subscribe(completed);
    // Trigger ngOnInit after subscribing so we catch early emits
    fixture.detectChanges();

    // Flush RAF steps and 100ms completion timeout
    jest.runOnlyPendingTimers();
    jest.advanceTimersByTime(200);

    expect(started).toHaveBeenCalled();
    expect(completed).toHaveBeenCalled();

    const texts = fixture.nativeElement.querySelectorAll('text.kp-wordcloud');
    expect(texts.length).toBe(words.length);

    // Click should bubble through output
    const emitSpy = jest.spyOn(comp.linkclick, 'emit');
    texts[0].dispatchEvent(new Event('click'));
    expect(emitSpy).toHaveBeenCalledWith('Angular');
  });

  it('does nothing on server platform (no DOM changes)', () => {
    const { fixture } = create([], 'server');
    fixture.detectChanges();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');
    // No children appended when not in browser
    expect(svg.childNodes.length).toBe(0);
  });

  it('emits layoutComplete immediately for empty words', () => {
    const { fixture, comp } = create([]);
    const completed = jest.fn();
    comp.layoutComplete.subscribe(completed);
    // Trigger ngOnInit; with empty words, layoutComplete emits synchronously
    fixture.detectChanges();
    expect(completed).toHaveBeenCalled();
  });

  it('restarts layout on size change (calls animateWordsOut)', async () => {
    const words: WordcloudWord[] = [{ text: 'Resize', size: 'medium' as any }];
    const { fixture, comp } = create(words);
    fixture.detectChanges();

    const animMock = animateWordsOut as unknown as jest.Mock;
    // Trigger size change
    comp.size = { width: 400, height: 225 };

    // Allow promises/timers
    await Promise.resolve();
    jest.runOnlyPendingTimers();

    // Our mock returns resolved promise; ensure it was called at least once
    expect(animMock.mock.calls.length).toBeGreaterThan(0);
  });
});
