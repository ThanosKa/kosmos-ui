// Usage: node --test lib/site-preset.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { chosenPreset, defaultChoice, presetCss } from './presets/index.ts';
import { readStoredChoice, sharedPresetScript, sitePresetCss, sitePresetKey, sitePresetScript, storedPreset } from './site-preset.ts';

const soft = { preset: 'soft', accent: false, radius: '6' };

/** Runs the head script in a document whose localStorage holds `stored`, and returns the style it adds, if any. */
function runScript(stored: string | null) {
  const appended: { id: string; textContent: string }[] = [];
  const document = {
    createElement: () => ({ id: '', textContent: '' }),
    head: { appendChild: (element: { id: string; textContent: string }) => appended.push(element) },
  };
  const localStorage = { getItem: (key: string) => (key === sitePresetKey ? stored : null) };
  runInNewContext(sitePresetScript, { document, localStorage });
  return appended;
}

test('the head script writes the stored CSS of a choice before anything paints', () => {
  const [style] = runScript(JSON.stringify(storedPreset(soft)));
  assert.equal(style?.id, 'site-preset');
  assert.equal(style?.textContent, sitePresetCss(soft));
});

test('the head script adds nothing for the Default, an empty store or a broken value', () => {
  assert.deepEqual(runScript(JSON.stringify(storedPreset(defaultChoice()))), []);
  assert.deepEqual(runScript(null), []);
  assert.deepEqual(runScript('{not json'), []);
});

test('the site applies exactly the CSS Get code gives, only on selectors that win over the tokens', () => {
  const applied = sitePresetCss(soft);
  assert.match(applied, /^html:root \{/);
  assert.match(applied, /^html\.dark \{/m);
  assert.equal(applied.replace('html:root {', ':root {').replace('html.dark {', '.dark {'), presetCss(chosenPreset(soft)));
});

test('a stored choice reads back as the choice, and an unreadable one as the Default', () => {
  assert.deepEqual(readStoredChoice(JSON.stringify(storedPreset(soft))), soft);
  assert.deepEqual(readStoredChoice(null), defaultChoice());
  assert.deepEqual(readStoredChoice('"soft"'), defaultChoice());
});

test('a shared link keeps the choice it names and writes its CSS over the stored one', () => {
  const style = { id: 'site-preset', textContent: 'old' };
  const store = new Map<string, string>();
  const document = { getElementById: (id: string) => (id === 'site-preset' ? style : null) };
  const localStorage = { setItem: (key: string, value: string) => store.set(key, value) };
  runInNewContext(sharedPresetScript(soft), { document, localStorage, Object });
  assert.equal(style.textContent, sitePresetCss(soft));
  assert.deepEqual(readStoredChoice(store.get(sitePresetKey) ?? null), soft);
  assert.deepEqual(runScript(store.get(sitePresetKey) ?? null).map((element) => element.textContent), [sitePresetCss(soft)]);
});
