// Usage: node --test lib/tints.test.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contrastRatio } from './contrast.ts';
import { presets, type Mode } from './presets/index.ts';
import { readRegistryItems } from './registry.ts';
import { readKosmosTokens } from './tokens.ts';

const tokens = readKosmosTokens();
const modes = { light: tokens.light, dark: { ...tokens.light, ...tokens.dark } };
const hues = ['gray', 'blue', 'green', 'teal', 'orange', 'red'] as const;
const solidHues = ['blue', 'green', 'orange', 'red'] as const;
const tagHues = ['orange', 'blue', 'amber', 'magenta', 'green', 'red'] as const;

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
    test(`${hue} tint, ${mode}: its text and its link read at 4.5:1 on its fill`, () => {
      const fill = value(`tint-${hue}`);
      for (const role of ['foreground', 'link']) {
        const ratio = contrastRatio(value(`tint-${hue}-${role}`), fill);
        assert.ok(ratio >= 4.5, `tint-${hue}-${role} on tint-${hue}: ${ratio.toFixed(2)}:1`);
      }
    });
  }

  for (const hue of tagHues) {
    test(`${hue} tag, ${mode}: its text reads at 4.5:1 on its fill`, () => {
      const ratio = contrastRatio(resolved(`tag-${hue}-foreground`), resolved(`tag-${hue}`));
      assert.ok(ratio >= 4.5, `tag-${hue}-foreground on tag-${hue}: ${ratio.toFixed(2)}:1`);
    });
  }

  test(`${mode}: a tag that shares a status hue is that hue's tint`, () => {
    for (const hue of ['orange', 'blue', 'green', 'red']) {
      assert.equal(resolved(`tag-${hue}`), value(`tint-${hue}`));
      assert.equal(resolved(`tag-${hue}-foreground`), value(`tint-${hue}-foreground`));
    }
  });

  test(`${mode}: every preset's focus outline reads at 3:1 on the tint of a tinted alert`, () => {
    for (const preset of presets) {
      for (const hue of solidHues) {
        const ratio = contrastRatio(preset[mode as Mode].ring, value(`tint-${hue}`));
        assert.ok(ratio >= 3, `${preset.name} ring on tint-${hue}: ${ratio.toFixed(2)}:1`);
      }
    }
  });

  for (const hue of solidHues) {
    test(`${hue} solid, ${mode}: white text reads at 4.5:1 on it`, () => {
      assert.equal(value('tint-solid-foreground'), '#ffffff');
      const ratio = contrastRatio(value('tint-solid-foreground'), value(`tint-${hue}-solid`));
      assert.ok(ratio >= 4.5, `tint-solid-foreground on tint-${hue}-solid: ${ratio.toFixed(2)}:1`);
    });
  }
}

test('the tokens registry item ships the Radix Colors notice with the tints', () => {
  const item = readRegistryItems().find((candidate) => candidate.name === 'tokens');
  assert.ok(item, 'the tokens item exists');
  assert.ok(Object.keys(item.cssVars?.light ?? {}).some((name) => name.startsWith('tint-')), 'the item carries the tints');
  const notice = (item.files ?? []).find((file) => readFileSync(file.path, 'utf8').includes('Copyright (c) 2021 Radix'));
  assert.ok(notice, 'a file of the item holds the Radix Colors copyright line');
  const text = readFileSync(notice.path, 'utf8');
  assert.match(text, /^MIT License/);
  assert.match(text, /The above copyright notice and this permission notice shall be included/);
  assert.ok(notice.target, 'the notice has a target, so shadcn add writes it into the app');
});
