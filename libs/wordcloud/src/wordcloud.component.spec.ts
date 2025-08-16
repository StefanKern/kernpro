import { Component, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WordcloudComponent } from './wordcloud.component';
import { WordcloudComponentInternal } from './wordcloud-internal.component';

@Component({
  selector: 'kp-wordcloud-internal',
  standalone: true,
  inputs: ['words', 'size'],
  template: '<div class="stub-internal"></div>',
})
class StubInternalComponent {
  linkclick = output<string>();
  layoutComplete = output<void>();
}

class IOStub {
  cb: IntersectionObserverCallback;
  el?: Element;
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe = (el: Element) => {
    this.el = el;
  };
  trigger(ratio: number) {
    this.cb([{ intersectionRatio: ratio, target: this.el! } as any], this as any);
  }
}

describe('WordcloudComponent (public)', () => {
  let io: IOStub;

  beforeEach(() => {
    // Mock IntersectionObserver globally
    (globalThis as any).IntersectionObserver = function (this: any, cb: IntersectionObserverCallback) {
      io = new IOStub(cb);
      return io as any;
    } as any;

    TestBed.overrideComponent(WordcloudComponent, {
      remove: { imports: [WordcloudComponentInternal] },
      add: { imports: [StubInternalComponent] },
    });

    TestBed.configureTestingModule({
      imports: [WordcloudComponent, StubInternalComponent],
    });
  });

  afterEach(() => {
    delete (globalThis as any).IntersectionObserver;
  });

  function create() {
    const fixture = TestBed.createComponent(WordcloudComponent);
    const comp = fixture.componentInstance;
    return { fixture, comp };
  }

  it('observes container, toggles visible on intersection, and unobserves', () => {
    const { fixture } = create();
    fixture.detectChanges(); // ngAfterViewInit subscribes IO

    // Child not rendered until visible() is true
    expect(fixture.debugElement.query(By.css('kp-wordcloud-internal'))).toBeNull();

    // Trigger intersection
    io.trigger(0.5);
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.css('kp-wordcloud-internal'));
    expect(child).not.toBeNull();
    expect(io.unobserve).toHaveBeenCalledTimes(1);
  });

  it('forwards linkclick from internal child', () => {
    const { fixture, comp } = create();
    const received = jest.fn();
    comp.linkclick.subscribe(received);
    fixture.detectChanges();
    io.trigger(1);
    fixture.detectChanges();

    const childDe = fixture.debugElement.query(By.directive(StubInternalComponent));
    const child = childDe.componentInstance as StubInternalComponent;
    child.linkclick.emit('Hello');

    expect(received).toHaveBeenCalledWith('Hello');
  });

  it('onLayoutComplete toggles loader based on loading()', () => {
    const { fixture, comp } = create();
    fixture.detectChanges();

    (comp as any).loading = (() => true) as any;
    comp.onLayoutComplete();
    expect(comp.showLoader()).toBe(true);

    (comp as any).loading = (() => false) as any;
    comp.onLayoutComplete();
    expect(comp.showLoader()).toBe(false);
  });

  it('internalWords returns [] when loading, or words when not loading', () => {
    const { comp } = create();
    const words = [
      { text: 'A', size: 'medium' as any },
      { text: 'B', size: 'small' as any },
    ] as const;
    (comp as any).words = (() => words) as any;
    (comp as any).loading = (() => true) as any;
    expect(comp.internalWords).toEqual([]);

    (comp as any).loading = (() => false) as any;
    expect(comp.internalWords).toEqual(words as any);
  });
});
