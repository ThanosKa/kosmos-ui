// Usage: node --test lib/contrast.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio } from './contrast.ts';

const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} is not ${expected}`);

test('black on white is 21:1, in either order', () => {
  near(contrastRatio('oklch(0 0 0)', 'oklch(1 0 0)'), 21);
  near(contrastRatio('#ffffff', '#000000'), 21);
});
test('a mid grey matches the published WCAG figure', () => {
  near(contrastRatio('#767676', '#ffffff'), 4.54);
});
test('a see-through background is laid over its backdrop', () => {
  near(contrastRatio('#000000', '#00000066'), contrastRatio('#000000', '#999999'));
  near(contrastRatio('#000000', 'oklch(1 0 0 / 0.6)', '#000000'), contrastRatio('#000000', '#999999'));
});
test('see-through text is laid over its background', () => {
  near(contrastRatio('oklch(0 0 0 / 40%)', '#ffffff'), contrastRatio('#999999', '#ffffff'));
});
test('a color it cannot read is an error, not a pass', () => {
  assert.throws(() => contrastRatio('color-mix(in oklab, red 12%, transparent)', '#ffffff'));
});
