// Usage: node --test lib/presets/default.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio } from '../contrast.ts';
import { defaultPreset, presets, type Mode, type PaletteToken } from './index.ts';

const modes: Mode[] = ['light', 'dark'];
const colored = new Set<PaletteToken>(['destructive', 'success', 'warning', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']);
const surfaces = ['background', 'card', 'popover', 'secondary', 'muted', 'sidebar'] as const;
const series = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const;

function oklch(value: string) {
  const match = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(value);
  assert.ok(match, `${value} is not written as oklch(L C H [/ alpha])`);
  const [lightness, chroma, , alpha] = match.slice(1).map(Number);
  return { lightness, chroma, alpha: Number.isNaN(alpha) ? 1 : alpha };
}

test('Default is the first preset, and Warm stays available', () => {
  assert.equal(defaultPreset.id, 'default');
  assert.equal(defaultPreset.name, 'Default');
  assert.ok(presets.some((preset) => preset.id === 'warm'));
});

for (const mode of modes) {
  const palette = defaultPreset[mode];

  test(`Default ${mode}: every color is a true grey, except destructive, success, warning and the chart series`, () => {
    const tinted = (Object.keys(palette) as PaletteToken[]).filter(
      (token) => !colored.has(token) && oklch(palette[token]).chroma !== 0,
    );
    assert.deepEqual(tinted, []);
    for (const token of colored) assert.ok(oklch(palette[token]).chroma > 0, `${token} keeps its hue`);
  });

  test(`Default ${mode}: primary, the current nav item and the meter are ink`, () => {
    assert.equal(defaultPreset.accent, undefined);
    assert.equal(palette.primary, palette.foreground);
    assert.equal(palette['accent-text'], palette.foreground);
  });

  test(`Default ${mode}: focus is ink at reduced alpha, 3:1 on every surface`, () => {
    const ink = oklch(palette.foreground);
    for (const token of ['ring', 'sidebar-ring'] as const) {
      const ring = oklch(palette[token]);
      assert.equal(ring.lightness, ink.lightness, `${token} is ink`);
      assert.ok(ring.alpha < 1, `${token} is see-through`);
    }
    for (const surface of surfaces) {
      const ratio = contrastRatio(palette.ring, palette[surface]);
      assert.ok(ratio >= 3, `ring on ${surface}: ${ratio.toFixed(2)}:1`);
    }
    const onHover = contrastRatio(palette['sidebar-ring'], palette['sidebar-accent'], palette.sidebar);
    assert.ok(onHover >= 3, `sidebar-ring on a hovered sidebar item: ${onHover.toFixed(2)}:1`);
  });

  test(`Default ${mode}: the five chart series are colors, each 3:1 on the page and on cards`, () => {
    for (const token of series) {
      for (const surface of ['background', 'card'] as const) {
        const ratio = contrastRatio(palette[token], palette[surface]);
        assert.ok(ratio >= 3, `${token} on ${surface}: ${ratio.toFixed(2)}:1`);
      }
    }
  });
}
