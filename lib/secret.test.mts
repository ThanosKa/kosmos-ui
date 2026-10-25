// Usage: node --test lib/secret.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { maskSecret } from '../registry/kosmos/lib/secret.ts';

const dots = (count: number) => '•'.repeat(count);

test('a key shows its last four characters, so keys can be told apart', () => {
  assert.equal(maskSecret('sk_live_51Hx9F4a'), `${dots(12)}9F4a`);
});

test('a short secret shows none of itself, since four characters would give most of it away', () => {
  assert.equal(maskSecret('hunter2'), dots(7));
  assert.equal(maskSecret('a1b2c3d4e5f'), dots(11));
  assert.equal(maskSecret(''), '');
});

test('a long secret takes at most 12 dots, so its last four stay in view in the field', () => {
  const webhookSecret = 'whsec_MfKQ9r3Vx7bT2nLp8sYc4dZa1eWg6hJu0kRq5tNv';
  assert.equal(maskSecret(webhookSecret), `${dots(12)}5tNv`);
});
