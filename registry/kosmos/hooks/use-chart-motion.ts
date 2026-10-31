'use client';

import * as React from 'react';
import { duration } from '@/registry/kosmos/lib/motion';

/**
 * When a chart plays its entrance. `session` plays it the first time a chart shows in this browser tab and draws every
 * chart at once after that, so a dashboard someone reloads all day stays still. `always` plays it each time a chart
 * scrolls into view, for a landing page. `none` never plays it.
 */
type ChartEntrance = 'session' | 'always' | 'none';

/**
 * The entrance of every chart inside that sets none of its own, `session` when nothing sets it. A showcase page wraps
 * its charts in `<ChartEntranceContext value="always">`, so each one plays on every load.
 */
const ChartEntranceContext = React.createContext<ChartEntrance>('session');

/** `waiting`: marks sit in their start state. `instant`: marks are in place with transitions off. */
type EntrancePhase = 'waiting' | 'instant' | 'entering' | 'done';

const playedKey = 'kosmos-chart-entrance';

function hasPlayed() {
  try {
    return sessionStorage.getItem(playedKey) === '1';
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(playedKey, '1');
  } catch {
    // A blocked storage only means the entrance plays again on the next load.
  }
}

/** Two frames, so marks rendered in their start state are painted before they transition. */
function afterPaint(callback: () => void) {
  let inner = 0;
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

/**
 * Starts a chart's entrance once a third of `ref` is in view. `revealed` turns true then; `instant` is true for the
 * frames in which a chart that skips its entrance moves into place with its transitions off.
 */
function useChartEntrance(ref: React.RefObject<Element | null>, entranceProp?: ChartEntrance) {
  const fallback = React.useContext(ChartEntranceContext);
  const entrance = entranceProp ?? fallback;
  // `none` starts in place with transitions off, so marks that mount after a measure don't play their start fade.
  const [phase, setPhase] = React.useState<EntrancePhase>(entrance === 'none' ? 'instant' : 'waiting');

  React.useEffect(() => {
    if (phase !== 'waiting') return;
    if (entrance === 'none' || (entrance === 'session' && hasPlayed())) {
      const frame = requestAnimationFrame(() => setPhase('instant'));
      return () => cancelAnimationFrame(frame);
    }
    const element = ref.current;
    if (!element) return;
    let cancelPaint = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        markPlayed();
        cancelPaint = afterPaint(() => setPhase('entering'));
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelPaint();
    };
  }, [phase, entrance, ref]);

  React.useEffect(() => {
    if (phase === 'instant') return afterPaint(() => setPhase('done'));
  }, [phase]);

  return { revealed: phase !== 'waiting', instant: phase === 'instant' };
}

/**
 * Whether a Recharts chart animates (`isAnimationActive`): `false` while it skips its entrance, `'auto'` otherwise, so
 * Recharts still skips it under reduced motion. A chart that skips its entrance animates again from the first time
 * `data` changes. Recharts plays the entrance on mount, not on scroll.
 */
function useEntranceAnimation(entranceProp: ChartEntrance | undefined, data: unknown): 'auto' | false {
  const fallback = React.useContext(ChartEntranceContext);
  const entrance = entranceProp ?? fallback;
  const [skip] = React.useState(() => entrance === 'none' || (entrance === 'session' && typeof window !== 'undefined' && hasPlayed()));
  const [firstData] = React.useState(data);
  React.useEffect(() => {
    if (!skip) markPlayed();
  }, [skip]);
  return skip && data === firstData ? false : 'auto';
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const list = window.matchMedia(reducedMotionQuery);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

/** Whether the person asked for reduced motion; false on the server. */
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

/** `ease-power3-out` as a function of time, for a value drawn frame by frame. */
const power3Out = (t: number) => 1 - (1 - t) ** 4;

/**
 * The number to show while `value` counts: from zero once `ready`, then from the number shown to each new value, over
 * the reveal duration. A change mid-count carries on from where it is. It jumps straight to the value while `instant`
 * and under reduced motion. Give screen readers the final value, not this one.
 */
function useCountUp(value: number, { ready = true, instant = false }: { ready?: boolean; instant?: boolean } = {}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState(ready ? value : 0);
  const current = React.useRef(ready ? value : 0);

  React.useEffect(() => {
    if (!ready) return;
    if (reduced || instant) {
      current.current = value;
      setShown(value);
      return;
    }
    const from = current.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / (duration.reveal * 1000), 1);
      current.current = from + (value - from) * power3Out(t);
      setShown(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, reduced, ready, instant]);

  return shown;
}

export { ChartEntranceContext, useChartEntrance, useCountUp, useEntranceAnimation, useReducedMotion, type ChartEntrance };
