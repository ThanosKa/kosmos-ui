// Usage: node --test lib/breadcrumb-fit.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hiddenCrumbs } from '../registry/kosmos/lib/breadcrumb-fit.ts';

// Five crumbs, 4px gaps, 14px separators and a 24px ellipsis. Each separator sits between two gaps, so a pair of
// neighbours costs 4 + 14 + 4 = 22px between them. All five in a row: 60 + 80 + 100 + 70 + 90 + 4 × 22 = 488px.
const trail = { widths: [60, 80, 100, 70, 90], gap: 4, separatorWidth: 14, ellipsisWidth: 24 };

test('hides nothing when the whole trail fits', () => {
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 488 }), { start: 1, count: 0 });
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 900 }), { start: 1, count: 0 });
});

test('hides the crumbs after the first, nearest the root first, until the trail fits', () => {
  // Hiding 1 (80) for the ellipsis (24): 60 + 24 + 100 + 70 + 90 + 4 × 22 = 432.
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 487 }), { start: 1, count: 1 });
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 432 }), { start: 1, count: 1 });
  // Hiding 2: 60 + 24 + 70 + 90 + 3 × 22 = 310.
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 431 }), { start: 1, count: 2 });
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 310 }), { start: 1, count: 2 });
  // Hiding 3: 60 + 24 + 90 + 2 × 22 = 218.
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 309 }), { start: 1, count: 3 });
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 218 }), { start: 1, count: 3 });
});

test('folds the first crumb in too when the first, the ellipsis and the current page do not fit', () => {
  // Hiding all four parents: 24 + 90 + 22 = 136.
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 217 }), { start: 0, count: 4 });
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 0 }), { start: 0, count: 4 });
});

test('always keeps the current page', () => {
  assert.deepEqual(hiddenCrumbs({ ...trail, widths: [60, 90], available: 10 }), { start: 0, count: 1 });
  assert.deepEqual(hiddenCrumbs({ ...trail, widths: [90], available: 10 }), { start: 1, count: 0 });
  assert.deepEqual(hiddenCrumbs({ ...trail, widths: [], available: 10 }), { start: 1, count: 0 });
});

test('never trades one crumb for an ellipsis wider than it while the first crumb still fits', () => {
  // The middle crumb is 20px: the ellipsis (24) would not save room, so the trail keeps it and the first crumb goes.
  assert.deepEqual(hiddenCrumbs({ ...trail, widths: [60, 20, 90], available: 150 }), { start: 0, count: 2 });
  assert.deepEqual(hiddenCrumbs({ ...trail, widths: [60, 20, 90], available: 214 }), { start: 1, count: 0 });
});

test('allows half a pixel of rounding', () => {
  assert.deepEqual(hiddenCrumbs({ ...trail, available: 487.6 }), { start: 1, count: 0 });
});
