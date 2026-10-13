// Usage: node --test lib/new-items.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { newItemUrls } from './new-items.ts';

const entries = [
  { title: 'Added Button and Badge', isoDate: '2026-10-11', body: '[Button](/docs/components/button) [Badge](/docs/components/badge)' },
  { title: 'Added OTP field', isoDate: '2026-10-13', body: '[OTP field](/docs/components/otp-field) [Auth](/docs/blocks/auth#x) [Button](/docs/components/button)' },
  { title: 'Changed Badge', isoDate: '2026-10-13', body: '[Badge](/docs/components/badge) [Tabs](/docs/components/tabs)' },
];
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

test('items of the first release are never new', () => {
  assert.deepEqual([...newItemUrls(entries, day('2026-10-13'))].sort(), ['/docs/blocks/auth', '/docs/components/otp-field']);
});
test('an item first named in a Changed entry is not new', () => {
  assert.ok(!newItemUrls(entries, day('2026-10-13')).has('/docs/components/tabs'));
});
test('new lasts 30 days from the entry date', () => {
  assert.equal(newItemUrls(entries, day('2026-11-12')).size, 2);
  assert.equal(newItemUrls(entries, day('2026-11-13')).size, 0);
});
test('a new Added entry makes its item new', () => {
  const more = [...entries, { title: 'Added Tooltip', isoDate: '2026-12-01', body: '[Tooltip](/docs/components/tooltip)' }];
  assert.deepEqual([...newItemUrls(more, day('2026-12-02'))], ['/docs/components/tooltip']);
});
