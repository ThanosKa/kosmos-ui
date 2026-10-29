// Usage: node --test lib/tokens.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { duration, ease } from '../registry/kosmos/lib/motion.ts';
import { parseKosmosTokens, readKosmosTokens } from './tokens.ts';

test('a block keeps the declarations after a nested at-rule', () => {
  const tokens = parseKosmosTokens(`@theme static {
  --animate-shimmer: shimmer 2s linear infinite;
  @keyframes shimmer {
    from { background-position: 100% 0; }
    to { background-position: 0% 0; }
  }
  --text-body: 0.875rem;
}`);
  assert.deepEqual(tokens.theme, { 'animate-shimmer': 'shimmer 2s linear infinite', 'text-body': '0.875rem' });
});

test('the tokens ship every type role', () => {
  const roles = Object.keys(readKosmosTokens().theme).filter((name) => name.startsWith('text-') && !name.includes('--'));
  for (const role of ['caption', 'small', 'body', 'title', 'heading', 'display', 'hero', 'lead']) {
    assert.ok(roles.includes(`text-${role}`), `text-${role} is missing`);
  }
});

test('the motion values for Motion code match the CSS', () => {
  const { theme } = readKosmosTokens();
  const curves: Record<string, readonly number[]> = { 'ease-power3-out': ease.power3Out, 'ease-smooth-in-out': ease.smoothInOut };
  for (const [name, value] of Object.entries(theme).filter(([key]) => key.startsWith('ease-'))) {
    assert.equal(`cubic-bezier(${curves[name]?.join(', ')})`, value, `${name} differs from registry/kosmos/lib/motion.ts`);
  }
  for (const [name, value] of Object.entries(theme).filter(([key]) => key.startsWith('transition-duration-'))) {
    const seconds = duration[name.replace('transition-duration-', '') as keyof typeof duration];
    assert.equal(`${Math.round(seconds * 1000)}ms`, value, `${name} differs from registry/kosmos/lib/motion.ts`);
  }
});
