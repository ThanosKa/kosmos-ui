'use client';

import * as React from 'react';
import { type Drift, holdHandlers, startDrift } from '@/registry/kosmos/lib/drift';

type UseDriftOptions = {
  /** `x` moves toward the start of the line (the other way in right-to-left text), `y` moves up. */
  axis: 'x' | 'y';
  /** Pixels per second; negative moves the other way. */
  speed: number;
  /** Holds the drift still, such as while a pause button is pressed. */
  held?: boolean;
  /** Where the loop starts, as a share of one copy from 0 to 1. */
  start?: number;
  /** `false` leaves the content where it is. */
  enabled?: boolean;
};

/**
 * Runs a drift on `track`, whose first child is one copy of the content, while `view` is on screen. Spread `hold` on
 * the element the visitor points at: a mouse or pen over it, a finger pressing it or keyboard focus inside it holds
 * the drift, together with `held`.
 */
export function useDrift<View extends HTMLElement = HTMLDivElement>({ axis, speed, held = false, start = 0, enabled = true }: UseDriftOptions) {
  const view = React.useRef<View>(null);
  const track = React.useRef<HTMLDivElement>(null);
  const drift = React.useRef<Drift>(undefined);
  const [holding, setHolding] = React.useState(false);
  const [hold] = React.useState(() => holdHandlers(setHolding));
  const latest = React.useRef({ speed, held: held || holding, start });

  React.useEffect(() => {
    latest.current.held = held || holding;
    drift.current?.hold(held || holding);
  }, [held, holding]);

  React.useEffect(() => {
    latest.current.speed = speed;
    drift.current?.setSpeed(speed);
  }, [speed]);

  React.useEffect(() => {
    const element = track.current;
    const copy = element?.firstElementChild;
    if (!enabled || !view.current || !element || !(copy instanceof HTMLElement)) return;
    const toward = axis === 'x' && getComputedStyle(element).direction === 'rtl' ? 1 : -1;
    const translate = axis === 'x' ? 'translateX' : 'translateY';
    const instance = startDrift({
      view: view.current,
      copy,
      axis,
      ...latest.current,
      render: (offset) => {
        element.style.transform = `${translate}(${toward * offset}px)`;
      },
    });
    drift.current = instance;
    return () => {
      instance.stop();
      drift.current = undefined;
      element.style.transform = '';
    };
  }, [axis, enabled]);

  return { view, track, hold };
}
