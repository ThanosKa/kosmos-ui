// Usage: node --test lib/presets/presets.test.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contrastRatio, parseColor } from '../contrast.ts';
import { parseKosmosTokens } from '../tokens.ts';
import { defaultPreset, presetCss, presetDesignMd, presets, type Mode, type Palette, type PaletteToken, type Preset } from './index.ts';

const byId = (id: string) => presets.find((preset) => preset.id === id)!;
const warm = byId('warm');

/** The palette a project gets from the preset's CSS, in one mode. */
function cssPalette(preset: Preset, mode: Mode): Palette {
  const { light, dark } = parseKosmosTokens(presetCss(preset));
  const { radius: _radius, ...palette } = mode === 'light' ? light : { ...light, ...dark };
  return palette as Palette;
}

/** The same preset with its accent turned off, as a picker offers it. */
const withoutAccent = (preset: Preset): Preset => ({ ...preset, accent: undefined });

const accentTokens = {
  primary: ['primary', 'sidebar-primary'],
  onPrimary: ['primary-foreground', 'sidebar-primary-foreground'],
  ring: ['ring', 'sidebar-ring', 'chart-1'],
  text: ['accent-text'],
} as const;
const accentTokenList: string[] = Object.values(accentTokens).flat();

test('Warm has the orange as its accent, an orange fill under white in light and dark ink in dark', () => {
  assert.deepEqual(warm.accent?.light.ring, 'oklch(0.62 0.2 38)');
  assert.deepEqual(warm.accent?.dark.ring, 'oklch(0.7 0.18 42)');
  assert.equal(warm.accent?.light.text, 'oklch(0.53 0.17 38)');
  for (const mode of ['light', 'dark'] as Mode[]) assert.equal(contrastRatio(warm.accent![mode].onPrimary, warm.accent![mode].primary) > 4.5, true);
});

test('Default has no accent, and Soft, Console and Night take the accents of their designs', () => {
  assert.equal(defaultPreset.accent, undefined);
  assert.equal(byId('soft').accent?.light.ring, '#1f6bff');
  assert.equal(byId('soft').accent?.dark.ring, '#6ea1ff');
  assert.equal(byId('console').accent?.light.ring, 'oklch(0.55 0.22 287)');
  assert.equal(byId('console').accent?.dark.ring, '#8b68ff');
  assert.equal(byId('night').accent?.light.ring, 'oklch(0.52 0.11 172)');
  assert.equal(byId('night').accent?.dark.ring, 'oklch(0.8 0.15 168)');
});

for (const preset of presets.filter((candidate) => candidate.accent)) {
  for (const mode of ['light', 'dark'] as Mode[]) {
    test(`${preset.name} ${mode}: the accent fills primary and colors focus, the current nav item, the meter and chart-1, nothing else`, () => {
      const withAccent = cssPalette(preset, mode);
      const bare = cssPalette(withoutAccent(preset), mode);
      const accent = preset.accent![mode];
      for (const token of accentTokens.primary) assert.equal(withAccent[token], accent.primary, token);
      for (const token of accentTokens.onPrimary) assert.equal(withAccent[token], accent.onPrimary, token);
      for (const token of accentTokens.ring) assert.equal(withAccent[token], accent.ring, token);
      for (const token of accentTokens.text) assert.equal(withAccent[token], accent.text, token);
      const changed = (Object.keys(bare) as PaletteToken[]).filter((token) => bare[token] !== withAccent[token]);
      assert.deepEqual(
        changed.filter((token) => !accentTokenList.includes(token)),
        [],
      );
    });
  }
}

const rgbSpread = (color: string) => {
  const { r, g, b } = parseColor(color);
  return Math.max(r, g, b) - Math.min(r, g, b);
};

for (const mode of ['light', 'dark'] as Mode[]) {
  test(`Default ${mode}: primary and its foreground are achromatic`, () => {
    const palette = cssPalette(defaultPreset, mode);
    for (const token of ['primary', 'primary-foreground', 'sidebar-primary', 'sidebar-primary-foreground'] as const) {
      assert.ok(rgbSpread(palette[token]) < 0.001, `${token}: ${palette[token]}`);
    }
  });
}

for (const preset of presets.filter((candidate) => candidate.accent)) {
  test(`${preset.name}: its accent is a color, so its primary is not a grey`, () => {
    for (const mode of ['light', 'dark'] as Mode[]) {
      assert.ok(rgbSpread(preset.accent![mode].primary) > 0.15, `${mode} primary: ${preset.accent![mode].primary}`);
    }
  });
}

/** A fill at 90%, which is how a primary button, checkbox, radio and switch look under the pointer. */
function atNinetyPercent(color: string) {
  const { r, g, b } = parseColor(color);
  const byte = (channel: number) => Math.round(channel * 255).toString(16).padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}e6`;
}

for (const { label, preset } of presets.flatMap((candidate) => [{ label: candidate.name, preset: candidate }, ...(candidate.accent ? [{ label: `${candidate.name} without its accent`, preset: withoutAccent(candidate) }] : [])])) {
  for (const mode of ['light', 'dark'] as Mode[]) {
    test(`${label} ${mode}: primary-foreground is 4.5:1 on primary and on its 90% hover, and the fill is a 3:1 mark on the page and cards`, () => {
      const palette = cssPalette(preset, mode);
      const misses: string[] = [];
      const rest = contrastRatio(palette['primary-foreground'], palette.primary);
      if (rest < 4.5) misses.push(`rest ${rest.toFixed(2)}:1`);
      for (const surface of ['background', 'card', 'popover', 'secondary', 'muted'] as const) {
        const hover = contrastRatio(palette['primary-foreground'], atNinetyPercent(palette.primary), palette[surface]);
        if (hover < 4.5) misses.push(`hover over ${surface} ${hover.toFixed(2)}:1`);
      }
      for (const surface of ['background', 'card'] as const) {
        const mark = contrastRatio(palette.primary, palette[surface]);
        if (mark < 3) misses.push(`fill on ${surface} ${mark.toFixed(2)}:1`);
      }
      assert.deepEqual(misses, []);
    });
  }
}

test('each description says what the color drives, or that there is none', () => {
  assert.match(defaultPreset.description, /no accent/);
  assert.match(defaultPreset.description, /buttons/);
  for (const preset of presets.filter((candidate) => candidate.accent)) {
    for (const part of [/fills buttons/, /switches/, /checkboxes/, /radios/, /sliders/, /tabs indicator/, /focus/, /current page in navigation/, /meters/, /first chart series/]) {
      assert.match(preset.description, part, preset.name);
    }
  }
});

test('a preset may set only these tokens, and nothing else', () => {
  const allowed = [
    'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
    'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'destructive', 'success', 'warning', 'border', 'input', 'ring', 'accent-text',
    'scrim', 'thumb', 'scrollbar-thumb',
    'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent',
    'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  ].sort();
  for (const preset of presets) {
    const { light, dark } = parseKosmosTokens(presetCss(preset));
    const { radius, ...lightPalette } = light;
    assert.ok(radius, `${preset.name}: radius`);
    assert.deepEqual(Object.keys(lightPalette).sort(), allowed, `${preset.name} light`);
    assert.deepEqual(Object.keys(dark).sort(), allowed, `${preset.name} dark`);
  }
});

test('a preset brings one accent: the same four steps per mode, and chart-2 to chart-5 are a mono ramp in every preset', () => {
  for (const preset of presets) {
    if (preset.accent) for (const mode of ['light', 'dark'] as Mode[]) assert.deepEqual(Object.keys(preset.accent[mode]).sort(), ['onPrimary', 'primary', 'ring', 'text']);
    for (const mode of ['light', 'dark'] as Mode[]) {
      for (const token of ['chart-2', 'chart-3', 'chart-4', 'chart-5'] as const) {
        assert.ok(rgbSpread(preset[mode][token]) < 0.05, `${preset.name} ${mode} ${token}: ${preset[mode][token]}`);
      }
    }
  }
});

test('the shipped tokens.css carries the CSS of the default preset', () => {
  const tokensCss = readFileSync(new URL('../../registry/kosmos/styles/tokens.css', import.meta.url), 'utf8');
  assert.ok(tokensCss.includes(presetCss(defaultPreset)), 'tokens.css is out of date: run pnpm registry:build');
});

for (const preset of presets.map(withoutAccent)) {
  test(`${preset.name}: its CSS without an accent reads back as its palette`, () => {
    const { light, dark } = parseKosmosTokens(presetCss(preset));
    assert.deepEqual(light, { radius: preset.radius, ...preset.light });
    assert.deepEqual(dark, preset.dark);
  });
}

test('Soft, Console and Night take the radius of their designs', () => {
  const radius = (id: string) => presets.find((preset) => preset.id === id)?.radius;
  assert.equal(radius('soft'), '1rem');
  assert.equal(radius('console'), '0.375rem');
  assert.equal(radius('night'), '0.5rem');
});

for (const preset of presets) {
  test(`${preset.name}: its CSS never sets a font, density, shadow or motion token`, () => {
    const { light, dark } = parseKosmosTokens(presetCss(preset));
    const styleTokens = [...Object.keys(light), ...Object.keys(dark)].filter((name) =>
      /^(font|text|spacing|shadow|ease|duration|leading|tracking)(-|$)/.test(name),
    );
    assert.deepEqual(styleTokens, []);
  });
}

type Check = { label: string; foreground: PaletteToken; background: PaletteToken; over?: PaletteToken; min: number };

const pageSurfaces = ['background', 'card', 'popover', 'secondary', 'muted'] as const;
const hoverFills = [
  ['accent', 'background'],
  ['accent', 'card'],
  ['accent', 'popover'],
] as const;

const text = (foreground: PaletteToken, background: PaletteToken, over?: PaletteToken): Check => ({
  label: `${foreground} text on ${over ? `${background} over ${over}` : background}`,
  foreground,
  background,
  over,
  min: 4.5,
});
const mark = (kind: string, foreground: PaletteToken, background: PaletteToken): Check => ({
  label: `${foreground} ${kind} on ${background}`,
  foreground,
  background,
  min: 3,
});

/** Every text, focus and chart pair a preset must hold, in each mode. */
const checks: Check[] = [
  ...(['foreground', 'muted-foreground', 'destructive'] as const).flatMap((role) => [
    ...pageSurfaces.map((surface) => text(role, surface)),
    ...hoverFills.map(([fill, surface]) => text(role, fill, surface)),
  ]),
  ...(['background', 'card', 'popover', 'secondary', 'muted'] as const).map((surface) => text('accent-text', surface)),
  ...hoverFills.map(([fill, surface]) => text('accent-text', fill, surface)),
  ...(['sidebar-foreground', 'muted-foreground', 'accent-text'] as const).map((role) => text(role, 'sidebar')),
  ...(['sidebar-foreground', 'accent-text'] as const).map((role) => text(role, 'sidebar-accent', 'sidebar')),
  text('card-foreground', 'card'),
  text('popover-foreground', 'popover'),
  text('secondary-foreground', 'secondary'),
  text('primary-foreground', 'primary'),
  text('accent-foreground', 'accent', 'background'),
  text('sidebar-primary-foreground', 'sidebar-primary', 'sidebar'),
  text('sidebar-accent-foreground', 'sidebar-accent', 'sidebar'),
  ...pageSurfaces.map((surface) => mark('focus', 'ring', surface)),
  mark('focus', 'sidebar-ring', 'sidebar'),
  ...(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const).flatMap((series) =>
    (['background', 'card'] as const).map((surface) => mark('chart mark', series, surface)),
  ),
];

/**
 * Pairs a preset is known to miss, kept because the preset reproduces values that shipped before the check
 * existed. Each one fails the test once it passes, so it is removed instead of left behind.
 */
const knownShortfalls = new Set<string>();

const ratio = (palette: Palette, check: Check) =>
  contrastRatio(palette[check.foreground], palette[check.background], check.over && palette[check.over]);

/** Each preset as it ships, and each preset with an accent also with the accent turned off. */
const variants = presets.flatMap((preset) =>
  preset.accent ? [{ label: preset.name, preset }, { label: `${preset.name} without its accent`, preset: withoutAccent(preset) }] : [{ label: preset.name, preset }],
);

for (const { label, preset } of variants) {
  for (const mode of ['light', 'dark'] as Mode[]) {
    test(`${label} ${mode}: text and the current nav item 4.5:1 on every surface, focus and chart marks 3:1`, () => {
      const palette = cssPalette(preset, mode);
      const misses = checks
        .filter((check) => !knownShortfalls.has(`${label} ${mode}: ${check.label}`))
        .filter((check) => ratio(palette, check) < check.min)
        .map((check) => `${check.label}: ${ratio(palette, check).toFixed(2)}:1, needs ${check.min}:1`);
      assert.deepEqual(misses, []);
    });
  }
}

test('every known shortfall still falls short', () => {
  for (const shortfall of knownShortfalls) {
    const [name, mode, label] = /^(.+) (light|dark): (.+)$/.exec(shortfall)!.slice(1);
    const preset = presets.find((candidate) => candidate.name === name);
    const check = checks.find((candidate) => candidate.label === label);
    assert.ok(preset && check, `${shortfall} names no preset or check`);
    assert.ok(ratio(cssPalette(preset, mode as Mode), check) < check.min, `${shortfall} now passes: remove it from knownShortfalls`);
  }
});

for (const preset of presets) {
  test(`${preset.name}: its DESIGN.md holds every value, light and dark on the token's own line`, () => {
    const lines = presetDesignMd(preset).split('\n');
    const row = (token: string) => lines.find((line) => line.startsWith(`| \`${token}\` |`));
    const [light, dark] = [cssPalette(preset, 'light'), cssPalette(preset, 'dark')];
    for (const token of Object.keys(light) as PaletteToken[]) {
      const line = row(token);
      assert.ok(line?.includes(light[token]) && line.includes(dark[token]), `${token}: ${line}`);
    }
    assert.ok(row('radius')?.includes(preset.radius), 'radius');
  });
}

test('a DESIGN.md says what the accent colors, or that the preset has none', () => {
  const accentSection = (preset: Preset) => /## Accent\n\n([\s\S]+?)\n## /.exec(presetDesignMd(preset))?.[1] ?? '';
  assert.match(accentSection(defaultPreset), /no accent/);
  for (const preset of presets.filter((candidate) => candidate.accent)) {
    const section = accentSection(preset);
    for (const value of [preset.accent!.light.ring, preset.accent!.dark.ring, preset.accent!.light.text]) {
      assert.ok(section.includes(value), `${preset.name}: ${value}`);
    }
  }
});
