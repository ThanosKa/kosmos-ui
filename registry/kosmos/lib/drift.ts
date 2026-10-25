export type DriftState = {
  /** How far the content has moved into its loop, in pixels, from 0 up to `distance`. */
  offset: number;
  /** Pixels per second; negative moves the other way. */
  velocity: number;
  /** The length of one loop the offset was measured against. */
  distance: number;
};

export type DriftFrame = {
  /** Seconds since the last frame. */
  dt: number;
  /** The speed to run at when not held, in pixels per second; negative moves the other way. */
  speed: number;
  /** Whether something (a pointer, focus, a pause button) holds the drift still. */
  held: boolean;
  /** The length of one loop now. */
  distance: number;
};

function wrap(offset: number, distance: number) {
  return distance > 0 ? ((offset % distance) + distance) % distance : 0;
}

/** How fast a drift eases, in seconds: the time it takes to close about two thirds of the gap to its new speed. */
export const driftEasing = { stop: 0.32, start: 0.7 } as const;

/** Within this many pixels per second of its target, a drift snaps to it: nobody sees the last half pixel. */
const settleSpeed = 0.5;

/** The longest frame a drift steps, in seconds, so a tab that comes back after a while does not jump. */
const longestFrame = 0.1;

/**
 * One frame of a drift: the velocity eases toward the speed (or toward zero while held), the offset moves by it and
 * wraps by one loop, and a change in the loop's length keeps the offset at the same share of it.
 */
export function stepDrift(state: DriftState, { dt, speed, held, distance }: DriftFrame): DriftState {
  const step = Math.min(dt, longestFrame);
  const target = held ? 0 : speed;
  const easing = held ? driftEasing.stop : driftEasing.start;
  const eased = state.velocity + (target - state.velocity) * (1 - Math.exp(-step / easing));
  const velocity = Math.abs(target - eased) < settleSpeed ? target : eased;
  const offset = state.distance > 0 ? (state.offset * distance) / state.distance : 0;
  return { offset: wrap(offset + velocity * step, distance), velocity, distance };
}

type HoldPointerEvent = { pointerType: string };
type HoldFocusEvent = { target: EventTarget | null; currentTarget: EventTarget | null; relatedTarget: EventTarget | null };

/**
 * Event handlers for the element a drift shows through. A mouse or pen over it, a finger pressing it and keyboard
 * focus inside it each hold the drift; `hold` hears `true` when the first hold starts and `false` when the last ends.
 * A finger passing over never holds it, so a tap cannot leave it stopped.
 */
export function holdHandlers(hold: (held: boolean) => void) {
  const reasons = new Set<'hover' | 'press' | 'focus'>();
  const set = (reason: 'hover' | 'press' | 'focus', on: boolean) => {
    const before = reasons.size > 0;
    if (on) reasons.add(reason);
    else reasons.delete(reason);
    if (reasons.size > 0 !== before) hold(!before);
  };
  return {
    onPointerEnter: ({ pointerType }: HoldPointerEvent) => {
      if (pointerType !== 'touch') set('hover', true);
    },
    onPointerLeave: () => set('hover', false),
    onPointerDown: ({ pointerType }: HoldPointerEvent) => {
      if (pointerType === 'touch') set('press', true);
    },
    onPointerUp: () => set('press', false),
    onPointerCancel: () => set('press', false),
    onFocus: ({ target }: HoldFocusEvent) => {
      if (target instanceof Element && target.matches(':focus-visible')) set('focus', true);
    },
    onBlur: ({ currentTarget, relatedTarget }: HoldFocusEvent) => {
      if (!(currentTarget instanceof Node && relatedTarget instanceof Node && currentTarget.contains(relatedTarget))) set('focus', false);
    },
  };
}

export type DriftOptions = {
  /** The part of the page the content shows through. The drift runs only while it is on screen. */
  view: Element;
  /** One copy of the content. Its size along `axis` is the length of one loop. */
  copy: HTMLElement;
  /** `x` measures the copy's width, `y` its height. */
  axis: 'x' | 'y';
  /** Pixels per second; negative moves the other way. */
  speed: number;
  /** Where the loop starts, as a share of one copy from 0 to 1. */
  start?: number;
  /** Moves the content `offset` pixels into its loop: once a frame while it runs, and to 0 under reduced motion. */
  render: (offset: number) => void;
};

export type Drift = {
  /** Eases to a stop while `held` is true, and back up to speed once it is false. */
  hold: (held: boolean) => void;
  /** Eases to a new speed. */
  setSpeed: (speed: number) => void;
  /** Stops for good and lets go of every observer. */
  stop: () => void;
};

/**
 * Moves content through a loop at a steady speed, one animation frame at a time. It eases to a stop when held and back
 * up when let go, keeps its place when the copy changes size, sleeps while off screen or at rest, and does not move at
 * all when the visitor asks for reduced motion.
 */
export function startDrift({ view, copy, axis, speed, start = 0, render }: DriftOptions): Drift {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const measure = () => (axis === 'x' ? copy.offsetWidth : copy.offsetHeight);
  let state: DriftState = { offset: start * measure(), velocity: speed, distance: measure() };
  let target = speed;
  let held = false;
  let onScreen = false;
  let frame = 0;
  let last = 0;

  const show = () => render(reduced.matches ? 0 : state.offset);
  const resting = () => state.velocity === 0 && (held || target === 0);
  const sleep = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const tick = (now: number) => {
    state = stepDrift(state, { dt: last ? (now - last) / 1000 : 0, speed: target, held, distance: state.distance });
    last = now;
    show();
    frame = resting() ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => {
    if (frame || reduced.matches || !onScreen || resting()) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  };
  const changeMotion = () => {
    sleep();
    show();
    wake();
  };

  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) wake();
    else sleep();
  });
  const size = new ResizeObserver(([entry]) => {
    const box = entry.borderBoxSize?.[0];
    const distance = box ? (axis === 'x' ? box.inlineSize : box.blockSize) : measure();
    // A copy first laid out here (it was hidden at start) takes its start offset now.
    state = state.distance > 0 ? stepDrift(state, { dt: 0, speed: target, held, distance }) : { ...state, offset: start * distance, distance };
    show();
  });

  show();
  visibility.observe(view);
  size.observe(copy);
  reduced.addEventListener('change', changeMotion);

  return {
    hold(value) {
      held = value;
      wake();
    },
    setSpeed(value) {
      target = value;
      wake();
    },
    stop() {
      sleep();
      visibility.disconnect();
      size.disconnect();
      reduced.removeEventListener('change', changeMotion);
    },
  };
}
