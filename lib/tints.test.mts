// Usage: node --test lib/tints.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio } from './contrast.ts';
import { presetPalette, presets, type Mode } from './presets/index.ts';
import { readRegistryItems } from './registry.ts';
import { readKosmosTokens } from './tokens.ts';

const tokens = readKosmosTokens();
const modes = { light: tokens.light, dark: { ...tokens.light, ...tokens.dark } };
const hues = ['gray', 'blue', 'green', 'amber', 'red', 'violet'] as const;
const solidHues = ['blue', 'green', 'amber', 'red', 'violet'] as const;

for (const [mode, declarations] of Object.entries(modes)) {
  const value = (name: string) => {
    const declared = declarations[name];
    assert.ok(declared, `--${name} is missing in ${mode}`);
    return declared;
  };
  const resolved = (name: string): string => {
    const reference = /^var\(--([\w-]+)\)$/.exec(value(name));
    return reference ? resolved(reference[1]) : value(name);
  };

  for (const hue of hues) {
    test(`${hue} tint, ${mode}: its text reads at 4.5:1 on its fill`, () => {
      const fill = value(`tint-${hue}`);
      const ratio = contrastRatio(value(`tint-${hue}-foreground`), fill);
      assert.ok(ratio >= 4.5, `tint-${hue}-foreground on tint-${hue}: ${ratio.toFixed(2)}:1`);
      const link = contrastRatio(value('foreground'), fill);
      assert.ok(link >= 4.5, `foreground (the link) on tint-${hue}: ${link.toFixed(2)}:1`);
    });
  }

  for (const hue of hues) {
    test(`${hue} tint, ${mode}: its dot reads at 3:1 on its fill and on the page`, () => {
      const dot = value(`tint-${hue}-dot`);
      assert.ok(contrastRatio(dot, value(`tint-${hue}`)) >= 3, `tint-${hue}-dot on tint-${hue}`);
      assert.ok(contrastRatio(dot, value('background')) >= 3, `tint-${hue}-dot on background`);
    });
  }

  test(`${mode}: no tint of the old tag and Radix hues is left`, () => {
    for (const name of ['tint-teal', 'tint-orange', 'tag-orange', 'tag-magenta']) {
      assert.equal(declarations[name], undefined, `--${name} was removed`);
    }
  });

  test(`${mode}: every preset's page and card read the text of an outline alert at 4.5:1`, () => {
    for (const preset of presets) {
      const palette = presetPalette(preset, mode as Mode);
      for (const surface of ['background', 'card'] as const) {
        for (const hue of hues) {
          const ratio = contrastRatio(value(`tint-${hue}-foreground`), palette[surface]);
          assert.ok(ratio >= 4.5, `${preset.name}: tint-${hue}-foreground on ${surface}: ${ratio.toFixed(2)}:1`);
        }
      }
    }
  });

  test(`${mode}: every preset's focus outline reads at 3:1 on the tint of a tinted alert`, () => {
    for (const preset of presets) {
      for (const ring of new Set([presetPalette(preset, mode as Mode).ring, preset[mode as Mode].ring])) {
        for (const hue of solidHues) {
          const ratio = contrastRatio(ring, value(`tint-${hue}`));
          assert.ok(ratio >= 3, `${preset.name} ring ${ring} on tint-${hue}: ${ratio.toFixed(2)}:1`);
        }
      }
    }
  });
}

test('the tokens item carries the tints and no Radix notice', () => {
  const item = readRegistryItems().find((candidate) => candidate.name === 'tokens');
  assert.ok(item, 'the tokens item exists');
  assert.ok(Object.keys(item.cssVars?.light ?? {}).some((name) => name.startsWith('tint-')), 'the item carries the tints');
  assert.equal((item.files ?? []).length, 0);
});
