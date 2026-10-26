// Usage: node --test lib/presets/choice.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseKosmosTokens } from '../tokens.ts';
import { chosenPreset, choiceFromParams, choiceParams, defaultChoice, presetChoices, presetCss, presetDesignMd, presetItemName, presetRegistryItem, presets } from './index.ts';

const byId = (id: string) => presets.find((preset) => preset.id === id)!;
const css = (choice: Parameters<typeof chosenPreset>[0]) => parseKosmosTokens(presetCss(chosenPreset(choice)));

test('the Default preset as it ships has a bare URL', () => {
  assert.equal(choiceParams(defaultChoice()).toString(), '');
  assert.deepEqual(choiceFromParams(new URLSearchParams('')), defaultChoice());
});

test('a URL opens exactly the choice it was made from', () => {
  const choice = { preset: 'soft', accent: false, radius: '6' };
  const url = choiceParams(choice).toString();
  assert.equal(url, 'preset=soft&accent=off&radius=6');
  assert.deepEqual(choiceFromParams(new URLSearchParams(url)), choice);
});

test("a URL leaves out what the preset already has: its accent and its own radius", () => {
  assert.equal(choiceParams({ preset: 'soft', accent: true, radius: '16' }).toString(), 'preset=soft');
  assert.deepEqual(choiceFromParams(new URLSearchParams('preset=night')), { preset: 'night', accent: true, radius: '8' });
});

test('a URL with values the picker does not offer falls back to the preset as it ships', () => {
  assert.deepEqual(choiceFromParams(new URLSearchParams('preset=nope&accent=maybe&radius=7')), defaultChoice());
  assert.deepEqual(choiceFromParams(new URLSearchParams('preset=default&accent=on')), defaultChoice());
  assert.deepEqual(choiceFromParams(new URLSearchParams('preset=console&radius=abc')), { preset: 'console', accent: true, radius: '6' });
});

test('the CSS of a preset as it ships is the CSS of the preset', () => {
  for (const preset of presets) assert.equal(presetCss(chosenPreset(defaultChoice(preset))), presetCss(preset), preset.name);
});

test('the CSS of a choice carries its radius, and with the accent off primary, focus and the current nav item go back to the palette', () => {
  const soft = byId('soft');
  const { light, dark } = css({ preset: 'soft', accent: false, radius: '6' });
  assert.equal(light.radius, '0.375rem');
  assert.equal(light.ring, soft.light.ring);
  assert.equal(light['accent-text'], soft.light['accent-text']);
  assert.equal(light.primary, soft.light.primary);
  assert.equal(css({ preset: 'soft', accent: true, radius: '6' }).light.primary, soft.accent!.light.primary);
  assert.equal(dark['chart-1'], soft.dark['chart-1']);
  assert.equal(css({ preset: 'soft', accent: true, radius: '0' }).light.radius, '0rem');
  assert.equal(css({ preset: 'soft', accent: true, radius: '0' }).light.ring, '#1f6bff');
});

test('the registry item of a choice installs exactly the CSS the page copies', () => {
  for (const choice of presetChoices()) {
    const item = presetRegistryItem(choice);
    const { light, dark } = css(choice);
    assert.deepEqual(item.cssVars, { light, dark }, item.name);
    assert.equal(item.type, 'registry:theme');
    assert.deepEqual(item.registryDependencies, ['@kosmos/tokens']);
  }
});

test('each choice has its own registry item, named after the preset when it ships as is', () => {
  const names = presetChoices().map((choice) => presetRegistryItem(choice).name);
  assert.equal(new Set(names).size, names.length);
  assert.equal(presetRegistryItem(defaultChoice(byId('soft'))).name, 'preset-soft');
  assert.equal(presetRegistryItem({ preset: 'soft', accent: false, radius: '6' }).name, 'preset-soft-no-accent-radius-6');
  assert.equal(presetRegistryItem({ preset: 'default', accent: false, radius: '0' }).name, 'preset-default-radius-0');
  for (const name of names) assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

/**
 * The capitalised words a DESIGN.md may use besides the first word of a sentence: the presets' names and the tools a
 * Kosmos project uses. Any other could be the name of a product.
 */
const designMdNames = new Set([...presets.map((preset) => preset.name), 'Kosmos', 'UI', 'CSS', 'Tailwind', 'DESIGN', 'MD', 'Meter']);

test('a DESIGN.md names no product', () => {
  for (const choice of presetChoices()) {
    const prose = presetDesignMd(chosenPreset(choice)).replace(/`[^`]*`/g, '');
    const midSentence = [...prose.matchAll(/(?<![.:#|-] |^|\n|")\b[A-Z]\w*/g)].map(([word]) => word);
    assert.deepEqual([...new Set(midSentence.filter((word) => !designMdNames.has(word)))], [], presetItemName(choice));
  }
});
