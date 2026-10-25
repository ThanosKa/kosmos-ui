// Usage: node --test lib/presets/presets.test.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contrastRatio } from '../contrast.ts';
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

// The palette of ADR 0007, as tokens.css shipped it before presets existed.
const adr0007 = {
  light: {
    radius: '0.625rem',
    background: 'oklch(0.975 0.004 106.5)',
    foreground: 'oklch(0.263 0.013 100.5)',
    card: 'oklch(0.99 0.002 106.5)',
    'card-foreground': 'oklch(0.263 0.013 100.5)',
    popover: 'oklch(0.99 0.002 106.5)',
    'popover-foreground': 'oklch(0.263 0.013 100.5)',
    primary: 'oklch(0.263 0.013 100.5)',
    'primary-foreground': 'oklch(0.985 0.003 106.5)',
    secondary: 'oklch(0.99 0.002 106.5)',
    'secondary-foreground': 'oklch(0.263 0.013 100.5)',
    muted: 'oklch(0.94 0.006 97)',
    'muted-foreground': 'oklch(0.52 0.01 97)',
    accent: 'oklch(0.263 0.013 100.5 / 0.05)',
    'accent-foreground': 'oklch(0.263 0.013 100.5)',
    destructive: 'oklch(0.55 0.225 28.5)',
    success: 'oklch(0.627 0.17 149.2)',
    warning: 'oklch(0.65 0.157 58.3)',
    border: 'oklch(0.915 0.006 97)',
    input: 'oklch(0.915 0.006 97)',
    ring: 'oklch(0.652 0.214 38)',
    'active-foreground': 'oklch(0.53 0.17 38)',
    scrim: 'oklch(0.263 0.013 100.5 / 0.4)',
    thumb: 'oklch(0.99 0.002 106.5)',
    'scrollbar-thumb': 'oklch(0.6 0.01 97)',
    'meter-primary': 'oklch(0.53 0.17 38)',
    sidebar: 'oklch(0.958 0.005 95)',
    'sidebar-foreground': 'oklch(0.263 0.013 100.5)',
    'sidebar-primary': 'oklch(0.263 0.013 100.5)',
    'sidebar-primary-foreground': 'oklch(0.985 0.003 106.5)',
    'sidebar-accent': 'oklch(0.263 0.013 100.5 / 0.05)',
    'sidebar-accent-foreground': 'oklch(0.263 0.013 100.5)',
    'sidebar-border': 'oklch(0.915 0.006 97)',
    'sidebar-ring': 'oklch(0.652 0.214 38)',
    'chart-1': 'oklch(0.652 0.214 38)',
    'chart-2': 'oklch(0.55 0.15 252)',
    'chart-3': 'oklch(0.64 0.14 82)',
    'chart-4': 'oklch(0.5 0.17 330)',
    'chart-5': 'oklch(0.6 0.13 160)',
  },
  dark: {
    background: 'oklch(0.2 0.006 95)',
    foreground: 'oklch(0.97 0.004 106.5)',
    card: 'oklch(0.23 0.006 95)',
    'card-foreground': 'oklch(0.97 0.004 106.5)',
    popover: 'oklch(0.2 0.006 95)',
    'popover-foreground': 'oklch(0.97 0.004 106.5)',
    primary: 'oklch(0.94 0.005 100)',
    'primary-foreground': 'oklch(0.263 0.013 100.5)',
    secondary: 'oklch(0.235 0.006 95)',
    'secondary-foreground': 'oklch(0.97 0.004 106.5)',
    muted: 'oklch(0.285 0.007 95)',
    'muted-foreground': 'oklch(0.7 0.008 97)',
    accent: 'oklch(1 0 0 / 0.06)',
    'accent-foreground': 'oklch(0.97 0.004 106.5)',
    destructive: 'oklch(0.715 0.165 22.1)',
    success: 'oklch(0.723 0.192 149.6)',
    warning: 'oklch(0.837 0.164 84.4)',
    border: 'oklch(0.26 0.006 95)',
    input: 'oklch(0.345 0.006 95)',
    ring: 'oklch(0.7 0.18 42)',
    'active-foreground': 'oklch(0.7 0.18 42)',
    scrim: 'oklch(0 0 0 / 0.6)',
    thumb: 'oklch(0.97 0.004 106.5)',
    'scrollbar-thumb': 'oklch(0.58 0.008 97)',
    'meter-primary': 'oklch(0.7 0.18 42)',
    sidebar: 'oklch(0.205 0.006 95)',
    'sidebar-foreground': 'oklch(0.97 0.004 106.5)',
    'sidebar-primary': 'oklch(0.94 0.005 100)',
    'sidebar-primary-foreground': 'oklch(0.263 0.013 100.5)',
    'sidebar-accent': 'oklch(1 0 0 / 0.06)',
    'sidebar-accent-foreground': 'oklch(0.97 0.004 106.5)',
    'sidebar-border': 'oklch(0.26 0.006 95)',
    'sidebar-ring': 'oklch(0.7 0.18 42)',
    'chart-1': 'oklch(0.7 0.18 42)',
    'chart-2': 'oklch(0.65 0.14 250)',
    'chart-3': 'oklch(0.76 0.14 82)',
    'chart-4': 'oklch(0.62 0.17 330)',
    'chart-5': 'oklch(0.7 0.14 160)',
  },
};

/** ADR 0007 colored the current nav item and the meter with two tokens of one value; presets name it `accent-text`. */
function foldNavAndMeter({ 'active-foreground': nav, 'meter-primary': meter, ...rest }: Record<string, string>) {
  assert.equal(nav, meter);
  return { ...rest, 'accent-text': nav };
}

test('the Warm CSS gives exactly the values of ADR 0007', () => {
  const { light, dark } = parseKosmosTokens(presetCss(warm));
  assert.deepEqual(light, foldNavAndMeter(adr0007.light));
  assert.deepEqual(dark, foldNavAndMeter(adr0007.dark));
});

test('Warm has the orange of ADR 0007 as its accent', () => {
  assert.deepEqual(warm.accent, {
    light: { ring: 'oklch(0.652 0.214 38)', text: 'oklch(0.53 0.17 38)' },
    dark: { ring: 'oklch(0.7 0.18 42)', text: 'oklch(0.7 0.18 42)' },
  });
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

const accentTokens = { ring: ['ring', 'sidebar-ring', 'chart-1'], text: ['accent-text'] } as const;

for (const preset of presets.filter((candidate) => candidate.accent)) {
  for (const mode of ['light', 'dark'] as Mode[]) {
    test(`${preset.name} ${mode}: the accent colors focus, the current nav item, the meter and chart-1, nothing else`, () => {
      const withAccent = cssPalette(preset, mode);
      const bare = cssPalette(withoutAccent(preset), mode);
      const accent = preset.accent![mode];
      for (const token of accentTokens.ring) assert.equal(withAccent[token], accent.ring, token);
      for (const token of accentTokens.text) assert.equal(withAccent[token], accent.text, token);
      const changed = (Object.keys(bare) as PaletteToken[]).filter((token) => bare[token] !== withAccent[token]);
      assert.ok(changed.every((token) => [...accentTokens.ring, ...accentTokens.text].includes(token as never)), changed.join());
    });
  }
}

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
  ...(['background', 'card', 'popover', 'secondary'] as const).map((surface) => text('accent-text', surface)),
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
const knownShortfalls = new Set(['Warm light: ring focus on muted']);

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
