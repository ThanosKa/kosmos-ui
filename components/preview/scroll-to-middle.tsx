'use client';

import { useEffect, useRef } from 'react';

/**
 * Scrolls the nearest ScrollArea it sits in halfway down (or across, with `axis="x"`), so a review preview shows
 * the overflow cue on both edges at once. Place it anywhere inside the scrolling content; it renders nothing visible.
 */
export function ScrollToMiddle({ axis = 'y' }: { axis?: 'x' | 'y' }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const viewport = ref.current?.closest<HTMLElement>('[data-slot=scroll-area-viewport]');
    if (!viewport) return;
    const scroll = () => {
      if (axis === 'y') viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
      else viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    };
    scroll();
    const observer = new ResizeObserver(scroll);
    observer.observe(viewport);
    const stop = setTimeout(() => observer.disconnect(), 1000);
    return () => {
      clearTimeout(stop);
      observer.disconnect();
    };
  }, [axis]);
  return <span ref={ref} aria-hidden className="hidden" />;
}
