// Usage: node --test lib/presets/presets.test.mts
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { contrastRatio, parseColor } from '../contrast.ts';
import { parseKosmosTokens, readKosmosTokens } from '../tokens.ts';
import { cssDeclarations } from './css.ts';
import { chartColors, paletteSections } from './palette.ts';
import { defaultPreset, presetCss, presetDesignMd, presetPalette, presets, type Mode, type Palette, type PaletteToken, type Preset } from './index.ts';

const byId = (id: string) => presets.find((preset) => preset.id === id)!;
const warm = byId('warm');

/** The variables a preset's style adds in one mode: its mode tokens and the variables its rules declare. */
function styleKeys(preset: Preset, mode: Mode): string[] {
  const declared = preset.style?.css?.[mode === 'light' ? ':root' : '.dark'] ?? {};
  return [...Object.keys(preset.style?.[mode] ?? {}), ...Object.keys(declared).map((name) => name.replace(/^--/, ''))];
}

/** The CSS of one mode, without what the preset's style adds. */
function cssWithoutStyle(preset: Preset, mode: Mode): Record<string, string> {
  const parsed = parseKosmosTokens(presetCss(preset))[mode];
  const style = new Set(styleKeys(preset, mode));
  return Object.fromEntries(Object.entries(parsed).filter(([token]) => !style.has(token)));
}

/** The palette a project gets from the preset's CSS, in one mode. */
function cssPalette(preset: Preset, mode: Mode): Palette {
  const light = cssWithoutStyle(preset, 'light');
  const { radius: _radius, ...palette } = mode === 'light' ? light : { ...light, ...cssWithoutStyle(preset, 'dark') };
  return palette as Palette;
}

/** The same preset with its accent turned off, as a picker offers it. */
const withoutAccent = (preset: Preset): Preset => ({ ...preset, accent: undefined });

const accentTokens = {
  primary: ['primary', 'sidebar-primary'],
  onPrimary: ['primary-foreground', 'sidebar-primary-foreground'],
  ring: ['ring', 'sidebar-ring'],
  text: ['accent-text'],
} as const;
const accentTokenList: string[] = Object.values(accentTokens).flat();

test('Warm has the orange as its accent, under white in light and dark', () => {
  assert.deepEqual(warm.accent?.light.ring, 'oklch(0.62 0.2 38)');
  assert.deepEqual(warm.accent?.dark.ring, 'oklch(0.7 0.18 42)');
  assert.equal(warm.accent?.light.text, 'oklch(0.53 0.17 38)');
  assert.equal(contrastRatio(warm.accent!.light.onPrimary, warm.accent!.light.primary) > 3, true);
  assert.equal(contrastRatio(warm.accent!.dark.onPrimary, warm.accent!.dark.primary) > 4.5, true);
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
    test(`${preset.name} ${mode}: the accent fills primary and colors focus, the current nav item and the meter, nothing else`, () => {
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

/**
 * Pairs a preset misses on purpose: Warm light keeps white on its bright orange by the maintainer's choice (ADR 0011),
 * held to 3:1 at rest and 2.8:1 under the 90% hover instead of 4.5:1. Each one fails the test once it passes, so it is removed instead of left behind.
 */
const knownShortfalls = new Set([
  'Warm light: primary-foreground text on primary',
  'Warm light: sidebar-primary-foreground text on sidebar-primary over sidebar',
]);

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
      const shortfall = knownShortfalls.has(`${label} ${mode}: primary-foreground text on primary`);
      const rest = contrastRatio(palette['primary-foreground'], palette.primary);
      if (rest < (shortfall ? 3 : 4.5)) misses.push(`rest ${rest.toFixed(2)}:1`);
      for (const surface of ['background', 'card', 'popover', 'secondary', 'muted'] as const) {
        const hover = contrastRatio(palette['primary-foreground'], atNinetyPercent(palette.primary), palette[surface]);
        if (hover < (shortfall ? 2.8 : 4.5)) misses.push(`hover over ${surface} ${hover.toFixed(2)}:1`);
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
    for (const part of [/fills buttons/, /switches/, /checkboxes/, /radios/, /sliders/, /tabs indicator/, /focus/, /current page in navigation/, /meters/]) {
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
    const [light, dark] = [cssWithoutStyle(preset, 'light'), cssWithoutStyle(preset, 'dark')];
    const { radius, ...lightPalette } = light;
    assert.ok(radius, `${preset.name}: radius`);
    assert.deepEqual(Object.keys(lightPalette).sort(), allowed, `${preset.name} light`);
    assert.deepEqual(Object.keys(dark).sort(), allowed, `${preset.name} dark`);
  }
});

test('a preset brings one accent: the same four steps per mode, and the chart series are the same in every preset', () => {
  for (const preset of presets) {
    if (preset.accent) for (const mode of ['light', 'dark'] as Mode[]) assert.deepEqual(Object.keys(preset.accent[mode]).sort(), ['onPrimary', 'primary', 'ring', 'text']);
    for (const mode of ['light', 'dark'] as Mode[]) {
      for (const token of paletteSections.chart) assert.equal(presetPalette(preset, mode)[token], chartColors[mode][token], `${preset.name} ${mode} ${token}`);
    }
  }
});

test('the shipped tokens.css carries the CSS of the default preset', () => {
  const tokensCss = readFileSync(new URL('../../registry/kosmos/styles/tokens.css', import.meta.url), 'utf8');
  assert.ok(tokensCss.includes(presetCss(defaultPreset)), 'tokens.css is out of date: run pnpm registry:build');
});

for (const preset of presets.map(withoutAccent)) {
  test(`${preset.name}: its CSS without an accent reads back as its palette`, () => {
    assert.deepEqual(cssWithoutStyle(preset, 'light'), { radius: preset.radius, ...preset.light });
    assert.deepEqual(cssWithoutStyle(preset, 'dark'), preset.dark);
  });
}

test('Soft, Console and Night take the radius of their designs', () => {
  const radius = (id: string) => presets.find((preset) => preset.id === id)?.radius;
  assert.equal(radius('soft'), '1rem');
  assert.equal(radius('console'), '0.375rem');
  assert.equal(radius('night'), '0.5rem');
});

const kosmosTokens = readKosmosTokens();
const kosmosSlots = new Set(
  readdirSync(new URL('../../registry/kosmos', import.meta.url), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .flatMap((entry) => [...readFileSync(join(entry.parentPath, entry.name), 'utf8').matchAll(/(?:data-slot['"]?\s*[=:]\s*\{?|\bslot:)\s*["'`]([a-z][a-z0-9-]*)/g)].map((match) => match[1])),
);

/** Buttons, fields and tabs look the same under every preset (ADR 0014): no rule reaches them, except in a `:not()`, but for type. */
const kosmosControls =
  /data-slot="(button|tabs-list|tabs-trigger|tabs-indicator|input|textarea|input-group|select-trigger|date-picker-trigger|combobox-input-group|combobox-chips|number-field-(group|decrement|increment)|otp-field-input)"/;
const kosmosControlTokens = ['shadow-control', 'shadow-primary', 'shadow-primary-hover', 'primary-hover', 'shadow-field'];
const typeProperties = ['font-family', 'font-weight', 'letter-spacing', 'text-transform'];
const notClause = /:not\((?:[^()]|\([^()]*\))*\)/g;

for (const preset of presets.filter((candidate) => candidate.style)) {
  const style = preset.style!;
  const declarations = cssDeclarations(style.css ?? {});

  test(`${preset.name}: its style sets only Kosmos tokens, each in the block it lives in`, () => {
    const themeTokens = new Set(Object.keys(kosmosTokens.theme));
    const modeTokens = new Set([...Object.keys(kosmosTokens.light), ...Object.keys(kosmosTokens.dark)].filter((token) => !(token in preset.light)));
    assert.deepEqual(Object.keys(style.theme ?? {}).filter((token) => !themeTokens.has(token)), [], 'theme');
    for (const mode of ['light', 'dark'] as Mode[]) assert.deepEqual(Object.keys(style[mode] ?? {}).filter((token) => !modeTokens.has(token)), [], mode);
  });

  test(`${preset.name}: a mode token its style sets in light it also sets in dark, so the site's raised light block never reaches dark`, () => {
    assert.deepEqual(Object.keys(style.light ?? {}).filter((token) => !(token in (style.dark ?? {}))), []);
  });

  test(`${preset.name}: a variable its rules declare is named after the preset`, () => {
    const own = declarations.filter(({ property }) => property.startsWith('--')).map(({ property }) => property);
    assert.deepEqual(own.filter((property) => !property.startsWith(`--${preset.id}-`)), []);
  });

  test(`${preset.name}: its rules reach components by a data-slot Kosmos has`, () => {
    const named = declarations.flatMap(({ within }) => within.flatMap((selector) => [...selector.matchAll(/data-slot="([^"]+)"/g)].map((match) => match[1])));
    assert.deepEqual([...new Set(named)].filter((slot) => !kosmosSlots.has(slot)), []);
  });

  test(`${preset.name}: its rules move, scale and blur only when motion is allowed, and keep the Kosmos fonts`, () => {
    const moving = declarations.filter(
      ({ property, value }) => ['scale', 'translate', 'transform'].includes(property) || (property === 'filter' && value.includes('blur')),
    );
    assert.deepEqual(moving.filter(({ within }) => !within.some((rule) => rule.includes('prefers-reduced-motion: no-preference'))), []);
    const fonts = declarations.filter(({ property, value }) => property === 'font-family' && !/^var\(--font-(sans|mono)\)$/.test(value));
    assert.deepEqual(fonts, []);
  });

  test(`${preset.name}: buttons, fields and tabs keep the Kosmos shape, bevel, press and focus; only their type may change`, () => {
    const tokens = [...Object.keys(style.light ?? {}), ...Object.keys(style.dark ?? {})];
    assert.deepEqual([...new Set(tokens.filter((token) => kosmosControlTokens.includes(token)))], []);
    const reshaped = declarations.filter(
      ({ within, property }) => within.some((rule) => kosmosControls.test(rule.replace(notClause, ''))) && !typeProperties.includes(property),
    );
    assert.deepEqual(reshaped, []);
  });

  test(`${preset.name}: its style sizes nothing, so the size stays the visitor's choice`, () => {
    const sizingTokens = Object.keys(style.theme ?? {}).filter((token) => token === 'spacing' || /^text-[a-z]+(--line-height)?$/.test(token));
    assert.deepEqual(sizingTokens, []);
    // A line under a tab, an indicator's inset and the frame around the work area draw a shape; they size no control.
    const decoration = /::(before|after)|tabs-indicator|sidebar-inset/;
    const sizing = declarations.filter(
      ({ within, property }) =>
        /^((min|max)-)?(height|width)$|^padding|^gap$|^font-size$|^line-height$|^margin/.test(property) && !within.some((rule) => decoration.test(rule)),
    );
    assert.deepEqual(sizing, []);
  });

  test(`${preset.name}: every corner its rules round follows the visitor's radius, so radius 0 squares them all`, () => {
    const ownVariables = new Map(declarations.filter(({ property }) => property.startsWith('--')).map(({ property, value }) => [property, value]));
    const followsRadius = (value: string): boolean =>
      value.includes('var(--radius') ||
      [...value.matchAll(/var\((--[\w-]+)\)/g)].some(([, name]) => ownVariables.has(name) && followsRadius(ownVariables.get(name)!));
    // A square edge, and the 1px that softens the ends of a meter segment, stay the same at every radius.
    const fixedShapes = ['0', '1px'];
    const fixed = declarations.filter(({ property, value }) => /radius$/.test(property) && !fixedShapes.includes(value) && !followsRadius(value));
    assert.deepEqual(fixed, []);
  });
}

/** The shadows a project ends up with under a preset in one mode: the preset's own, else the Kosmos ones. */
function presetShadows(preset: Preset, mode: Mode): Record<string, string> {
  return { ...kosmosTokens[mode], ...parseKosmosTokens(presetCss(preset))[mode] };
}

type ShadowLayer = { inset: boolean; lengths: number[]; color: string };

/** A box-shadow split into its layers, each with its offsets, blur and spread in pixels, and its color. */
function shadowLayers(shadow: string): ShadowLayer[] {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  [...shadow].forEach((char, index) => {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      layers.push(shadow.slice(start, index));
      start = index + 1;
    }
  });
  layers.push(shadow.slice(start));
  return layers.map((layer) => {
    const words = layer.trim().split(/\s+/);
    const inset = words[0] === 'inset';
    const rest = inset ? words.slice(1) : words;
    const colorAt = rest.findIndex((word) => !/^-?[\d.]+(px)?$/.test(word));
    const end = colorAt === -1 ? rest.length : colorAt;
    return { inset, lengths: rest.slice(0, end).map(Number.parseFloat), color: rest.slice(end).join(' ') };
  });
}

const isLayer = (layer: ShadowLayer, inset: boolean, lengths: number[]) =>
  layer.inset === inset && layer.lengths.join(' ') === lengths.join(' ');
const outerRing = (layer: ShadowLayer) => isLayer(layer, false, [0, 0, 0, 1]);
const innerRim = (layer: ShadowLayer) => isLayer(layer, true, [0, 1, 0, 0]);
const innerLine = (layer: ShadowLayer) => isLayer(layer, true, [0, 0, 0, 1]);
const isWhite = (color: string) => /^(oklch\(1 0 0|rgb\(255 255 255|#fff\b|#ffffff|white)/.test(color);
const lightFromAbove = (layer: ShadowLayer) => layer.inset && layer.lengths[1] > 0 && isWhite(layer.color);

for (const preset of presets) {
  test(`${preset.name} dark: every surface has a dark outer ring and a 1px rim of light inside, a popover its inner line`, () => {
    const shadows = presetShadows(preset, 'dark');
    const unlit = ['shadow-control', 'shadow-card', 'shadow-modal'].filter((token) => {
      const layers = shadowLayers(shadows[token]);
      return !layers.some(outerRing) || !layers.some(innerRim);
    });
    const popover = shadowLayers(shadows['shadow-popover']);
    if (!popover.some(outerRing) || !popover.some((layer) => innerRim(layer) || innerLine(layer))) unlit.push('shadow-popover');
    assert.deepEqual(unlit, []);
  });

  test(`${preset.name} dark: the primary button is bevelled, lit from above inside`, () => {
    assert.ok(shadowLayers(presetShadows(preset, 'dark')['shadow-primary']).some(lightFromAbove));
  });

  for (const mode of ['light', 'dark'] as Mode[]) {
    test(`${preset.name} ${mode}: a popover sits at least as high as a card, and a dialog higher than both`, () => {
      const shadows = presetShadows(preset, mode);
      const depth = (token: string) => Math.max(0, ...shadowLayers(shadows[token]).filter((layer) => !layer.inset).map((layer) => layer.lengths[2] ?? 0));
      const [card, popover, modal] = [depth('shadow-card'), depth('shadow-popover'), depth('shadow-modal')];
      assert.ok(card <= popover && popover < modal, `blur: card ${card}px, popover ${popover}px, dialog ${modal}px`);
    });
  }

  test(`${preset.name} light: every surface has a 1px hairline ring`, () => {
    const shadows = presetShadows(preset, 'light');
    const unringed = ['shadow-control', 'shadow-card', 'shadow-popover', 'shadow-modal'].filter((token) => !shadowLayers(shadows[token]).some(outerRing));
    assert.deepEqual(unringed, []);
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
