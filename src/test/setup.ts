import '@testing-library/jest-dom';

// Embla (used by the hero carousel) reads matchMedia during setup. JSDOM does
// not provide it, so keep the browser contract available to component tests.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (!window.IntersectionObserver) {
  class TestIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds: readonly number[] = [0];

    constructor(private readonly callback: IntersectionObserverCallback) {}
    disconnect() {}
    observe(element: Element) {
      this.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this);
    }
    takeRecords(): IntersectionObserverEntry[] { return []; }
    unobserve() {}
  }

  window.IntersectionObserver = TestIntersectionObserver;
}

if (!window.ResizeObserver) {
  class TestResizeObserver implements ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    disconnect() {}
    observe(target: Element) {
      this.callback([], this);
      void target;
    }
    unobserve() {}
  }

  window.ResizeObserver = TestResizeObserver;
}
