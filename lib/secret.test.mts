// Usage: node --test lib/secret.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { maskSecret } from '../registry/kosmos/lib/secret.ts';

const dots = (count: number) => '•'.repeat(count);

test('a key shows its last four characters, so keys can be told apart', () => {
  assert.equal(maskSecret('acme_sk_7Q2K9F4a'), `${dots(12)}9F4a`);
});

test('a short secret shows none of itself, since four characters would give most of it away', () => {
  assert.equal(maskSecret('hunter2'), dots(12));
  assert.equal(maskSecret('a1b2c3d4e5f'), dots(12));
});

test('every hidden secret takes the same 12 dots, so it gives away neither its length nor pushes its end out of view', () => {
  const signingSecret = 'acme_whsig_MfKQ9r3Vx7bT2nLp8sYc4dZa1eWg6hJu0kRq5tNv';
  assert.equal(maskSecret(signingSecret), `${dots(12)}5tNv`);
});

test('an empty value has nothing to hide', () => {
  assert.equal(maskSecret(''), '');
});
