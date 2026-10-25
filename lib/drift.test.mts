// Usage: node --test lib/drift.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { holdHandlers, stepDrift, type DriftFrame, type DriftState } from '../registry/kosmos/lib/drift.ts';

test('a drift at full speed moves its speed times the frame', () => {
  const next = stepDrift({ offset: 10, velocity: 40, distance: 400 }, { dt: 0.05, speed: 40, held: false, distance: 400 });
  assert.equal(next.offset, 12);
  assert.equal(next.velocity, 40);
});

test('the offset wraps by one loop, whichever way it moves', () => {
  const forward = stepDrift({ offset: 398, velocity: 40, distance: 400 }, { dt: 0.1, speed: 40, held: false, distance: 400 });
  assert.equal(forward.offset, 2);
  const back = stepDrift({ offset: 1, velocity: -40, distance: 400 }, { dt: 0.1, speed: -40, held: false, distance: 400 });
  assert.equal(back.offset, 397);
});

const run = (state: DriftState, frame: Omit<DriftFrame, 'dt'>, seconds: number, fps = 60) => {
  let next = state;
  for (let i = 0; i < Math.round(seconds * fps); i++) next = stepDrift(next, { ...frame, dt: 1 / fps });
  return next;
};

test('a hold eases the drift down, to about a third of its speed after 0.32s', () => {
  const held = run({ offset: 0, velocity: 40, distance: 400 }, { speed: 40, held: true, distance: 400 }, 0.32, 100);
  assert.ok(Math.abs(held.velocity - 40 / Math.E) < 0.1, `velocity ${held.velocity}`);
  assert.ok(held.offset > 0, 'it glides on while it slows');
});

test('letting go winds the drift back up, to about two thirds of its speed after 0.7s', () => {
  const resumed = run({ offset: 0, velocity: 0, distance: 400 }, { speed: 40, held: false, distance: 400 }, 0.7, 100);
  assert.ok(Math.abs(resumed.velocity - 40 * (1 - 1 / Math.E)) < 0.1, `velocity ${resumed.velocity}`);
});

test('the drift slows the same at 60 and at 120 frames a second', () => {
  const start = { offset: 0, velocity: 40, distance: 400 };
  const at60 = run(start, { speed: 40, held: true, distance: 400 }, 0.5, 60);
  const at120 = run(start, { speed: 40, held: true, distance: 400 }, 0.5, 120);
  assert.ok(Math.abs(at60.velocity - at120.velocity) < 0.01, `${at60.velocity} vs ${at120.velocity}`);
  assert.ok(Math.abs(at60.offset - at120.offset) < 0.2, `${at60.offset} vs ${at120.offset}`);
});

test('a held drift comes to rest at exactly zero, so the loop can sleep', () => {
  const rested = run({ offset: 0, velocity: 40, distance: 400 }, { speed: 40, held: true, distance: 400 }, 2);
  assert.equal(rested.velocity, 0);
});

test('the drift keeps its place in the loop when the loop gets longer or shorter', () => {
  const wider = stepDrift({ offset: 50, velocity: 0, distance: 200 }, { dt: 0.01, speed: 0, held: true, distance: 400 });
  assert.equal(wider.offset, 100);
  const narrower = stepDrift({ offset: 300, velocity: 0, distance: 400 }, { dt: 0.01, speed: 0, held: true, distance: 100 });
  assert.equal(narrower.offset, 75);
});

test('a long gap between frames, such as a tab coming back, moves no more than a tenth of a second would', () => {
  const back = stepDrift({ offset: 0, velocity: 40, distance: 400 }, { dt: 5, speed: 40, held: false, distance: 400 });
  assert.equal(back.offset, 4);
});

test('a loop with no length stays at zero', () => {
  const empty = stepDrift({ offset: 0, velocity: 40, distance: 0 }, { dt: 0.1, speed: 40, held: false, distance: 0 });
  assert.equal(empty.offset, 0);
});

const holds = () => {
  const calls: boolean[] = [];
  return { calls, handlers: holdHandlers((held) => calls.push(held)) };
};

test('a mouse or pen over the drift holds it until it leaves; a finger passing over does not', () => {
  const { calls, handlers } = holds();
  handlers.onPointerEnter({ pointerType: 'touch' });
  handlers.onPointerEnter({ pointerType: 'mouse' });
  handlers.onPointerLeave();
  handlers.onPointerEnter({ pointerType: 'pen' });
  assert.deepEqual(calls, [true, false, true]);
});

test('a finger holds the drift while it presses, and lets go when it lifts or the page scrolls', () => {
  const { calls, handlers } = holds();
  handlers.onPointerDown({ pointerType: 'mouse' });
  handlers.onPointerDown({ pointerType: 'touch' });
  handlers.onPointerUp();
  handlers.onPointerDown({ pointerType: 'touch' });
  handlers.onPointerCancel();
  assert.deepEqual(calls, [true, false, true, false]);
});

test('the drift stays held while any one hold remains', () => {
  const { calls, handlers } = holds();
  handlers.onPointerEnter({ pointerType: 'pen' });
  handlers.onPointerDown({ pointerType: 'touch' });
  handlers.onPointerLeave();
  handlers.onPointerUp();
  assert.deepEqual(calls, [true, false]);
});
