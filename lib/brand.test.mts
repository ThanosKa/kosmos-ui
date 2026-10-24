// Usage: node --test lib/brand.test.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { findBrand, readBrandColors } from './brand.ts';
import { contrastRatio } from './contrast.ts';
import { readRegistryItems } from './registry.ts';
import { readKosmosTokens } from './tokens.ts';

const peony = { brand: 'oklch(0.56 0.2 350)', hover: 'oklch(0.52 0.2 350)', foreground: 'oklch(1 0 0)', selection: 'oklch(0.56 0.2 350 / 0.28)' };

test('the guard finds the brand colour in any spelling', () => {
  assert.equal(findBrand('color: oklch(0.56 0.2 350);', peony).length, 1);
  assert.equal(findBrand('color: oklch(56% 0.20 350 / 0.5);', peony).length, 1);
  assert.equal(findBrand('fill="#C32E85"', peony).length, 1);
  assert.equal(findBrand('rgb(195 46 133)', peony).length, 1);
  assert.equal(findBrand('rgb(195, 46, 133, 0.4)', peony).length, 1);
});

test('the guard finds the brand tokens', () => {
  assert.deepEqual(findBrand('className="bg-brand text-brand-foreground"', peony), ['-brand', '-brand-foreground']);
  assert.deepEqual(findBrand('background: var(--color-brand);', peony), ['-brand']);
});

test('the guard passes other colours and words', () => {
  assert.deepEqual(findBrand('oklch(0.56 0.2 30) #c32e86 rgb(195 46 134) the brand of a product, brandIcons', peony), []);
});

test('no registry item holds the brand colour or a brand token', () => {
  const colors = readBrandColors();
  for (const item of readRegistryItems()) {
    const sources = (item.files ?? []).map((file) => readFileSync(file.path, 'utf8'));
    assert.deepEqual(findBrand([JSON.stringify(item), ...sources].join('\n'), colors), [], item.name);
  }
});

test('text on the Pro badge and the Get Pro button passes 4.5:1, at rest and on hover', () => {
  const { brand, hover, foreground } = readBrandColors();
  for (const [state, fill] of [['at rest', brand], ['on hover', hover]]) {
    const ratio = contrastRatio(foreground, fill);
    assert.ok(ratio >= 4.5, `${state}: ${ratio.toFixed(2)}:1`);
  }
});

test('selected text, which takes the foreground color, passes 4.5:1', () => {
  const { selection } = readBrandColors();
  for (const mode of ['light', 'dark'] as const) {
    const tokens = readKosmosTokens()[mode];
    const ratio = contrastRatio(tokens.foreground, selection, tokens.background);
    assert.ok(ratio >= 4.5, `${mode}: ${ratio.toFixed(2)}:1`);
  }
});
