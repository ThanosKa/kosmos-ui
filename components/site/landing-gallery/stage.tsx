'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(reducedMotionQuery);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
}

type StageProps = {
  /** The width the preview lays out at, in pixels; the stage scales it to the card. */
  base?: number;
  /** Milliseconds between ticks. */
  interval?: number;
  /** The tick to show when motion is off. */
  staticTick?: number;
  children: (tick: number) => ReactNode;
};

/** A fixed 8:5 frame that scales a live part to the card and ticks while it is on screen. */
export function Stage({ base = 360, interval = 1000, staticTick = 3, children }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [inView, setInView] = useState(false);
  const [tick, setTick] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / base));
    const view = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    resize.observe(element);
    view.observe(element);
    return () => {
      resize.disconnect();
      view.disconnect();
    };
  }, [base]);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setTick((current) => current + 1), interval);
    return () => clearInterval(id);
  }, [inView, reduced, interval]);

  return (
    <div ref={ref} className="relative aspect-[8/5] overflow-hidden rounded-xl bg-background outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
      <div
        inert
        style={{ '--scale': scale, '--base': `${base}px`, '--base-h': `${base * 0.625}px` } as CSSProperties}
        className="pointer-events-none absolute start-0 top-0 h-(--base-h) w-(--base) origin-top-left scale-(--scale) overflow-hidden"
      >
        {children(reduced ? staticTick : tick)}
      </div>
    </div>
  );
}

/** The portal container for parts that render in a portal, and their positioning root inside the stage. */
export function PortalHost({ children, className }: { children: (host: HTMLElement | null) => ReactNode; className?: string }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setHost} className={`relative h-full w-full ${className ?? ''}`}>
      {children(host)}
    </div>
  );
}

/** Collision padding that lets a menu or list ignore the viewport edges: the stage scrolls with the page, and a flip or shift would carry the overlay out of its card. */
export const keepInStage = -10_000;

/** The first `count` characters of a text. */
export const typed = (text: string, count: number) => text.slice(0, Math.max(0, Math.min(text.length, count)));

/** A loop position: ticks `0..length-1`, repeating. */
export const at = (tick: number, length: number) => tick % length;
