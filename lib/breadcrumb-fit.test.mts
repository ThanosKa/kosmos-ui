// Usage: node --test lib/breadcrumb-fit.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hiddenCrumbCount } from '../registry/kosmos/lib/breadcrumb-fit.ts';

// Five crumbs, 4px gaps, 14px separators and a 24px ellipsis. Each separator sits between two gaps, so a pair of
// neighbours costs 4 + 14 + 4 = 22px between them. All five in a row: 60 + 80 + 100 + 70 + 90 + 4 × 22 = 488px.
const trail = { widths: [60, 80, 100, 70, 90], gap: 4, separatorWidth: 14, ellipsisWidth: 24 };

test('hides nothing when the whole trail fits', () => {
  assert.equal(hiddenCrumbCount({ ...trail, available: 488 }), 0);
  assert.equal(hiddenCrumbCount({ ...trail, available: 900 }), 0);
});

test('hides the crumbs after the first, nearest the root first, until the trail fits', () => {
  // Hiding 1 (80) for the ellipsis (24): 60 + 24 + 100 + 70 + 90 + 4 × 22 = 432.
  assert.equal(hiddenCrumbCount({ ...trail, available: 487 }), 1);
  assert.equal(hiddenCrumbCount({ ...trail, available: 432 }), 1);
  // Hiding 2: 60 + 24 + 70 + 90 + 3 × 22 = 310.
  assert.equal(hiddenCrumbCount({ ...trail, available: 431 }), 2);
  assert.equal(hiddenCrumbCount({ ...trail, available: 310 }), 2);
  // Hiding 3: 60 + 24 + 90 + 2 × 22 = 218.
  assert.equal(hiddenCrumbCount({ ...trail, available: 309 }), 3);
});

test('always keeps the first crumb and the current page', () => {
  assert.equal(hiddenCrumbCount({ ...trail, available: 100 }), 3);
  assert.equal(hiddenCrumbCount({ ...trail, available: 0 }), 3);
});

test('never hides a crumb from a trail of one or two', () => {
  assert.equal(hiddenCrumbCount({ ...trail, widths: [60, 90], available: 10 }), 0);
  assert.equal(hiddenCrumbCount({ ...trail, widths: [90], available: 10 }), 0);
  assert.equal(hiddenCrumbCount({ ...trail, widths: [], available: 10 }), 0);
});

test('never trades one crumb for an ellipsis wider than it', () => {
  // Three crumbs, the middle one 20px: the ellipsis (24) would not save room, so the trail keeps it and truncates.
  assert.equal(hiddenCrumbCount({ ...trail, widths: [60, 20, 90], available: 150 }), 0);
});

test('allows half a pixel of rounding', () => {
  assert.equal(hiddenCrumbCount({ ...trail, available: 487.6 }), 0);
});
