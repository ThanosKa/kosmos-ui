// Usage: node --test lib/tokens.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
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
