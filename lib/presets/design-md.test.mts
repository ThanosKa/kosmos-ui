// Usage: node --test lib/presets/design-md.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lint } from '@google/design.md/linter';
import { findBrand, readBrandColors } from '../brand.ts';
import { readKosmosTokens } from '../tokens.ts';
import { chosenPreset, defaultPreset, presetChoices, presetDesignMd, presetItemName, siteDesignMd } from './index.ts';

const tokens = readKosmosTokens();
const brand = readBrandColors();
const site = siteDesignMd(defaultPreset, tokens, brand);
const choices = presetChoices().map((choice) => ({ choice, name: presetItemName(choice), designMd: presetDesignMd(chosenPreset(choice), tokens) }));

/**
 * Warm light keeps white on its bright orange by the maintainer's choice (ADR 0011), at 3:1 instead of 4.5:1: the
 * primary button's pair falls short there, and only there.
 */
const knownShortfall = (name: string, path: string | undefined) =>
  /^preset-warm(?!.*-no-accent)/.test(name) && ['components.button-primary', 'components.button-primary-hover'].includes(path ?? '');

/** What Google's linter reports beyond a color no component reads: a ring, the scrim, a thumb, a chart series. */
function problems(name: string, designMd: string): string[] {
  return lint(designMd)
    .findings.filter((finding) => finding.severity === 'error' || ['contrast-ratio', 'section-order'].includes(finding.rule ?? '') || (finding.severity === 'warning' && finding.rule !== 'orphaned-tokens'))
    .filter((finding) => !(finding.rule === 'contrast-ratio' && knownShortfall(name, finding.path)))
    .map((finding) => `${name}: ${finding.rule} ${finding.path ?? ''} ${finding.message}`);
}

test('the DESIGN.md of every preset choice passes the DESIGN.md linter', () => {
  assert.deepEqual(choices.flatMap(({ name, designMd }) => problems(name, designMd)), []);
});

test('the site DESIGN.md passes the DESIGN.md linter', () => {
  assert.deepEqual(problems('DESIGN.md', site), []);
});

test("the known shortfall is still short: Warm light's primary button fails the linter's contrast check", () => {
  const warm = choices.find(({ name }) => name === 'preset-warm')!;
  const flagged = lint(warm.designMd).findings.filter((finding) => finding.rule === 'contrast-ratio').map((finding) => finding.path);
  assert.deepEqual(flagged, ['components.button-primary', 'components.button-primary-hover']);
});

test('every DESIGN.md has the sections in the order of the format, with Motion after Components', () => {
  const order = ['Overview', 'Colors', 'Typography', 'Layout', 'Elevation & Depth', 'Shapes', 'Components', 'Motion', "Do's and Don'ts"];
  for (const { name, designMd } of [...choices, { name: 'DESIGN.md', designMd: site }]) {
    assert.deepEqual(lint(designMd).sections, order, name);
  }
});

test('no preset DESIGN.md holds the brand color, and the site DESIGN.md does', () => {
  assert.deepEqual(choices.filter(({ designMd }) => findBrand(designMd, brand).length).map(({ name }) => name), []);
  assert.ok(findBrand(site, brand).length > 0);
  assert.match(site, /appears only on the site/);
});

test('a DESIGN.md names the fonts, and its size in the spacing unit', () => {
  for (const { choice, name, designMd } of choices) {
    assert.match(designMd, /fontFamily: Geist\n/, name);
    assert.match(designMd, /fontFamily: Geist Mono\n/, name);
    const unit = chosenPreset(choice).spacing ?? '0.25rem';
    assert.ok(designMd.includes(`\n  unit: ${unit}\n`), `${name}: spacing unit ${unit}`);
  }
});
