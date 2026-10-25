// Usage: node --test lib/stat-delta.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { statDelta } from '../registry/kosmos/lib/stat-delta.ts';

test('a rise reads as an up arrow, a plus sign and a percentage', () => {
  assert.deepEqual(statDelta(12.4), { direction: 'up', tone: 'good', text: '+12.4%' });
});

test('a fall reads as a down arrow and a true minus sign, and is bad news by default', () => {
  assert.deepEqual(statDelta(-3.25), { direction: 'down', tone: 'bad', text: '−3.3%' });
});

test('no change, or one too small to show, is flat and neutral, with no sign', () => {
  assert.deepEqual(statDelta(0), { direction: 'flat', tone: 'neutral', text: '0%' });
  assert.deepEqual(statDelta(0.04), { direction: 'flat', tone: 'neutral', text: '0%' });
  assert.deepEqual(statDelta(-0.04), { direction: 'flat', tone: 'neutral', text: '0%' });
});

test('a metric where falling is good, like errors, turns the tone around but keeps the arrow', () => {
  assert.deepEqual(statDelta(-8, { goodWhen: 'down' }), { direction: 'down', tone: 'good', text: '−8%' });
  assert.deepEqual(statDelta(8, { goodWhen: 'down' }), { direction: 'up', tone: 'bad', text: '+8%' });
});

test('a change in a rate reads in percentage points', () => {
  assert.equal(statDelta(0.3, { unit: 'points' })?.text, '+0.3 pts');
  assert.equal(statDelta(-1, { unit: 'points' })?.text, '−1 pts');
});

test('a small change in a rate can keep more decimals', () => {
  assert.deepEqual(statDelta(-0.06, { unit: 'points', fractionDigits: 2 }), { direction: 'down', tone: 'bad', text: '−0.06 pts' });
  assert.deepEqual(statDelta(0.004, { fractionDigits: 2 }), { direction: 'flat', tone: 'neutral', text: '0%' });
});

test('a large change keeps its grouping', () => {
  assert.equal(statDelta(1240.5)?.text, '+1,240.5%');
});

test('a format of your own writes the text, for another locale', () => {
  const german = new Intl.NumberFormat('de-DE', { signDisplay: 'exceptZero', maximumFractionDigits: 1 });
  assert.deepEqual(statDelta(-3.25, { format: (value) => `${german.format(value)} %` }), {
    direction: 'down',
    tone: 'bad',
    text: '-3,3 %',
  });
});

test('a change against an earlier zero has nothing to show', () => {
  assert.equal(statDelta(Number.POSITIVE_INFINITY), null);
  assert.equal(statDelta(Number.NaN), null);
});

test('a metric that is neither good nor bad when it moves stays neutral', () => {
  assert.equal(statDelta(8, { goodWhen: 'neither' })?.tone, 'neutral');
  assert.equal(statDelta(-8, { goodWhen: 'neither' })?.tone, 'neutral');
});
