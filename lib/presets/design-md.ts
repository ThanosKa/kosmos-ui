import type { BrandColors } from '../brand.ts';
import { oklchOf, parseColor } from '../contrast.ts';
import type { KosmosTokens } from '../tokens.ts';
import { presetSizes, type PresetSize } from './choice.ts';
import { cssRulesText } from './css.ts';
import { paletteSections, presetPalette, type Mode, type PaletteToken, type Preset } from './palette.ts';

const uses: Record<PaletteToken, string> = {
  background: 'The page.',
  foreground: 'Text on the page: headings, values, a hovered item.',
  card: 'Cards, stat tiles and board cards.',
  'card-foreground': 'Text on a card.',
  popover: 'Popovers, menus, tooltips, toasts, dialogs and drawers.',
  'popover-foreground': 'Text in a popover, menu or dialog.',
  primary: 'The one filled action per view, a checked checkbox or radio, a switch that is on, the slider range and the tabs indicator. The accent in a preset with one.',
  'primary-foreground': 'Text and icons on a primary fill: 4.5:1 on it, also under its hover.',
  secondary: 'Secondary buttons and text fields.',
  'secondary-foreground': 'Text on a secondary button.',
  muted: 'Tracks and quiet fills: segmented control, switch, meter.',
  'muted-foreground': 'Secondary text and idle chrome. The faintest text there is.',
  accent: 'The see-through hover on ghost buttons, nav items, menu items and rows.',
  'accent-foreground': 'Text on a hovered item.',
  destructive: 'Destructive actions and errors, as text, icons and dots.',
  success: 'Dots, icons and meter segments that mean done or healthy.',
  warning: 'Dots, icons and meter segments that need attention.',
  border: 'Dividers between list, menu and table items.',
  input: 'The edge of a text field.',
  ring: 'Focus outlines.',
  'accent-text': 'The label and icon of the current page in navigation, and a Meter in its primary tone.',
  scrim: 'The backdrop behind dialogs and drawers.',
  thumb: 'Switch and slider thumbs.',
  'scrollbar-thumb': 'The scrollbar thumb, lighter than muted text.',
  sidebar: 'The sidebar surface.',
  'sidebar-foreground': 'Sidebar text and a hovered sidebar item.',
  'sidebar-primary': 'A filled mark in the sidebar, like the workspace initial. The same value as primary.',
  'sidebar-primary-foreground': 'Text on a sidebar-primary fill.',
  'sidebar-accent': 'The hover on sidebar items.',
  'sidebar-accent-foreground': 'Text on a hovered sidebar item.',
  'sidebar-border': 'The line between the sidebar and the page, and between its groups.',
  'sidebar-ring': 'Focus outlines inside the sidebar.',
  'chart-1': 'The first chart series.',
  'chart-2': 'The second chart series.',
  'chart-3': 'The third chart series.',
  'chart-4': 'The fourth chart series.',
  'chart-5': 'The fifth chart series. More than five fold into "Other".',
};

const modes: Mode[] = ['light', 'dark'];
const darkName = (token: string) => `${token}-dark`;
const yamlString = (value: string) => JSON.stringify(value);
const round = (value: number, digits = 3) => Number(value.toFixed(digits));
const px = (value: number) => `${round(value, 2)}px`;
const remToPx = (value: string) => Number.parseFloat(value) * 16;

/** The primary fill under the pointer, as `--primary-hover` in `tokens.css` paints it: a lightness step darker in light, the fill at 90% in dark. */
function primaryHover(primary: string, mode: Mode): string {
  if (mode === 'dark') return primary.startsWith('#') ? `${primary}e6` : primary.replace(/\)$/, ' / 0.9)');
  const match = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(primary);
  if (match) return `oklch(${round(Number(match[1]) - 0.04)} ${match[2]} ${match[3]})`;
  const { lightness, chroma, hue } = oklchOf(primary);
  return `oklch(${round(lightness - 0.04)} ${round(chroma)} ${round(hue, 1)})`;
}

type ColorToken = PaletteToken | 'primary-hover' | 'brand' | 'brand-hover' | 'brand-foreground';
type Colors = Record<Mode, Partial<Record<ColorToken, string>>>;

function designColors(preset: Preset, brand?: BrandColors): Colors {
  const colors = {} as Colors;
  for (const mode of modes) {
    const palette = presetPalette(preset, mode);
    colors[mode] = {
      ...palette,
      'primary-hover': primaryHover(palette.primary, mode),
      ...(brand ? { brand: brand.brand, 'brand-hover': brand.hover, 'brand-foreground': brand.foreground } : {}),
    };
  }
  return colors;
}

/** A fill the surface shows through, such as the 5% hover overlay. */
function seeThrough(color: string | undefined): boolean {
  if (!color) return false;
  if (color === 'transparent') return true;
  return parseColor(color).alpha < 0.5;
}

/** The step a radius token of `@theme inline` resolves to for a `--radius` in pixels. */
function radiusStep(expression: string, radius: number): number {
  if (expression === 'var(--radius)') return radius;
  const match = /^calc\(var\(--radius\) ([+-]) (min\(var\(--radius\), )?([\d.]+)px\)?\)$/.exec(expression);
  if (!match) throw new Error(`Can't resolve the radius step ${expression}`);
  const [, sign, capped, amount] = match;
  const step = capped ? Math.min(radius, Number(amount)) : Number(amount);
  return Math.max(0, sign === '+' ? radius + step : radius - step);
}

function designRounded(preset: Preset, tokens: KosmosTokens) {
  const radius = remToPx(preset.radius);
  const step = (name: string) => radiusStep(tokens.themeInline[`radius-${name}`], radius);
  return {
    checkbox: { value: px(step('sm')), use: `The ${sizesOf(preset).checkbox} checkbox (\`rounded-sm\`): a larger radius on so small a box reads as a radio.` },
    item: { value: px(Math.max(0, step('lg') - 4)), use: 'An item inside a menu, select list, command list or the sidebar (`rounded-[calc(var(--radius-lg)-4px)]`), concentric inside the 4px padding of its list.' },
    segment: { value: px(step('md')), use: 'A segmented item or a number field stepper (`rounded-md`), inside its track or field.' },
    control: { value: px(step('lg')), use: 'Buttons, text fields, segmented tracks, tooltips and menus (`rounded-lg`). The base of the ladder, `--radius`.' },
    overlay: { value: px(step('xl')), use: 'Popovers, dialogs, drawers, toasts, the command palette, alerts and radio cards (`rounded-xl`).' },
    card: { value: px(step('2xl')), use: 'Cards and stat tiles (`rounded-2xl`).' },
    sheet: { value: px(step('3xl')), use: 'The top of a bottom sheet (`rounded-t-3xl`).' },
    full: { value: '9999px', use: 'Radios, badges, tags and pills (`rounded-full`).' },
  };
}

function spacingUnit(preset: Preset): string {
  return preset.spacing ?? presetSizes.default;
}

function units(preset: Preset) {
  const unit = remToPx(spacingUnit(preset));
  return (count: number) => px(count * unit);
}

function sizesOf(preset: Preset) {
  const size = units(preset);
  return { button: size(7.5), field: size(8.5), row: size(9), checkbox: size(4), icon: size(3.5), rowIcon: size(4), smallIcon: size(3) };
}

function sizeOf(preset: Preset): PresetSize {
  const unit = spacingUnit(preset);
  return (Object.keys(presetSizes) as PresetSize[]).find((size) => presetSizes[size] === unit) ?? 'default';
}

function designSpacing(preset: Preset) {
  const unit = spacingUnit(preset);
  const size = units(preset);
  return {
    unit: { value: unit, use: 'The unit of every height, padding and gap (`--spacing`). Text sizes do not follow it.' },
    'button-sm': { value: size(6), use: 'A small button (`h-6`).' },
    button: { value: size(7.5), use: 'A button, a menu or select item, a sidebar item, and a field in a toolbar (`h-7.5`).' },
    field: { value: size(8.5), use: 'A text field, textarea row or select trigger in a form (`h-8.5`).' },
    row: { value: size(9), use: 'A large button, a tab and a command item (`h-9`).' },
    badge: { value: size(5.5), use: 'A badge (`h-5.5`).' },
    'button-padding': { value: size(2.5), use: 'The side padding of a button (`px-2.5`).' },
    'field-padding': { value: size(3), use: 'The side padding of a text field (`px-3`).' },
    'card-padding': { value: size(4), use: 'The padding of a card and the gap between stat tiles (`p-4`, `gap-4`).' },
  };
}

const typeRoles = {
  caption: 'Meta, badges, keyboard hints, table headers, eyebrows and sidebar group labels.',
  small: 'Descriptions, hints, errors and field labels above a control.',
  body: 'The default UI text: buttons, menu items, table cells, checkbox and switch labels.',
  title: 'Dialog, drawer and card titles; page titles in app chrome at weight 500.',
  heading: 'Section headings of docs and site pages outside the app frame. Never in app chrome.',
  display: 'Stat values, always with tabular figures.',
  hero: 'The headline of a marketing block only.',
  lead: 'The intro paragraph of a marketing block only.',
} as const;

type TypeRole = keyof typeof typeRoles;
type Typography = { fontFamily: string; fontSize: string; fontWeight: number; lineHeight: string | number; letterSpacing: string };

/** A unitless line height from `tokens.css`, as pixels when it lands on a whole pixel and as the ratio otherwise. */
function lineHeight(value: string, fontSize: string): string | number {
  const ratio = /^calc\(([\d.]+) \/ ([\d.]+)\)$/.exec(value);
  const number = ratio ? Number(ratio[1]) / Number(ratio[2]) : Number(value);
  const pixels = number * remToPx(fontSize);
  return Math.abs(pixels - Math.round(pixels)) < 0.001 ? `${Math.round(pixels)}px` : round(number, 4);
}

function designTypography(preset: Preset, tokens: KosmosTokens): Record<string, Typography> {
  const theme = { ...tokens.theme, ...preset.style?.theme };
  const role = (name: TypeRole, fontFamily = 'Geist'): Typography => {
    const fontSize = theme[`text-${name}`];
    return {
      fontFamily,
      fontSize,
      fontWeight: Number(theme[`text-${name}--font-weight`] ?? 400),
      lineHeight: lineHeight(theme[`text-${name}--line-height`], fontSize),
      letterSpacing: theme[`text-${name}--letter-spacing`],
    };
  };
  const roles = Object.fromEntries((Object.keys(typeRoles) as TypeRole[]).map((name) => [name, role(name)]));
  return {
    ...roles,
    'body-medium': { ...role('body'), fontWeight: 500 },
    'caption-medium': { ...role('caption'), fontWeight: 500 },
    mono: { ...role('body', 'Geist Mono'), letterSpacing: '0em' },
  };
}

type Part = {
  fill?: ColorToken;
  text?: ColorToken;
  typography?: string;
  rounded?: string;
  height?: string;
  padding?: string;
  edge?: string;
};
type ComponentSpec = { name: string; what: string; light: Part; dark?: Partial<Part> };

const button = { typography: 'body-medium', rounded: 'control', height: 'button', padding: 'button-padding' };

const coreComponents: ComponentSpec[] = [
  { name: 'page', what: 'The page and its text', light: { fill: 'background', text: 'foreground', typography: 'body' } },
  { name: 'button-primary', what: 'Primary button, one per view', light: { ...button, fill: 'primary', text: 'primary-foreground', edge: 'shadow-primary' } },
  { name: 'button-primary-hover', what: 'Primary button under the pointer', light: { fill: 'primary-hover', text: 'primary-foreground', edge: 'shadow-primary-hover' } },
  { name: 'button-secondary', what: 'Secondary button, and every icon button in a header or toolbar', light: { ...button, fill: 'secondary', text: 'secondary-foreground', edge: 'shadow-control' } },
  { name: 'button-secondary-hover', what: 'Secondary button under the pointer', light: { fill: 'muted', text: 'secondary-foreground', edge: 'shadow-control' } },
  { name: 'button-ghost', what: 'Ghost button: no fill and no edge', light: { ...button, text: 'foreground' } },
  { name: 'button-ghost-hover', what: 'Ghost button under the pointer', light: { fill: 'accent', text: 'foreground' } },
  { name: 'button-destructive', what: 'Destructive button: red text on the secondary surface', light: { ...button, fill: 'secondary', text: 'destructive', edge: 'shadow-control' } },
  { name: 'button-destructive-hover', what: 'Destructive button under the pointer', light: { fill: 'muted', text: 'destructive', edge: 'shadow-control' } },
  { name: 'text-field', what: 'Input, textarea, select trigger', light: { fill: 'secondary', text: 'foreground', typography: 'body', rounded: 'control', height: 'field', padding: 'field-padding', edge: 'shadow-field' } },
  { name: 'card', what: 'Card, stat tile, board card', light: { fill: 'card', text: 'card-foreground', rounded: 'card', padding: 'card-padding', edge: 'shadow-card' } },
  { name: 'popover', what: 'Popover, toast, command palette', light: { fill: 'popover', text: 'popover-foreground', typography: 'body', rounded: 'overlay', edge: 'shadow-popover' } },
  { name: 'menu', what: 'Dropdown menu, select list, combobox list, tooltip', light: { fill: 'popover', text: 'popover-foreground', typography: 'body', rounded: 'control', edge: 'shadow-popover' } },
  { name: 'dialog', what: 'Dialog, drawer', light: { fill: 'popover', text: 'popover-foreground', rounded: 'overlay', edge: 'shadow-modal' } },
  { name: 'badge', what: 'Badge, the neutral pill', light: { fill: 'secondary', text: 'secondary-foreground', typography: 'caption-medium', rounded: 'full', height: 'badge', edge: 'shadow-control' } },
  { name: 'sidebar-item', what: 'Sidebar item, idle', light: { fill: 'sidebar', text: 'muted-foreground', typography: 'body', rounded: 'item', height: 'button' } },
  { name: 'sidebar-item-hover', what: 'Sidebar item under the pointer', light: { fill: 'sidebar-accent', text: 'sidebar-foreground' } },
  {
    name: 'sidebar-item-current',
    what: 'Sidebar item of the current page: flat in light, raised in dark',
    light: { fill: 'sidebar-accent', text: 'accent-text' },
    dark: { fill: 'muted', edge: 'shadow-control' },
  },
  { name: 'tab', what: 'Tab, idle', light: { text: 'muted-foreground', typography: 'body-medium', rounded: 'control', height: 'row' } },
  { name: 'tab-current', what: 'Tab, selected', light: { text: 'foreground' } },
  { name: 'tabs-indicator', what: 'The line under the selected tab', light: { fill: 'primary' } },
];

const brandComponents: ComponentSpec[] = [
  { name: 'button-pro', what: 'A Pro mark on the site: a primary button filled with the brand color', light: { ...button, fill: 'brand', text: 'brand-foreground' } },
  { name: 'button-pro-hover', what: 'A Pro button under the pointer', light: { fill: 'brand-hover', text: 'brand-foreground' } },
  { name: 'badge-pro', what: 'A Pro badge on the site', light: { fill: 'brand', text: 'brand-foreground', typography: 'caption-medium', rounded: 'full', height: 'badge' } },
];

const partOf = (spec: ComponentSpec, mode: Mode): Part => (mode === 'light' ? spec.light : { ...spec.light, ...spec.dark });

/** A component's token entry in one mode. A see-through fill comes without its text: the text keeps the color it has at rest, and the linter cannot lay the fill over the surface to check the pair. */
function componentEntry(part: Part, mode: Mode, colors: Colors): [string, string][] {
  const color = (token: ColorToken) => yamlString(`{colors.${mode === 'light' ? token : darkName(token)}}`);
  const showText = part.text && !seeThrough(part.fill && colors[mode][part.fill]);
  return [
    ...(part.fill ? [['backgroundColor', color(part.fill)] as [string, string]] : []),
    ...(showText ? [['textColor', color(part.text!)] as [string, string]] : []),
    ...(part.typography ? [['typography', yamlString(`{typography.${part.typography}}`)] as [string, string]] : []),
    ...(part.rounded ? [['rounded', yamlString(`{rounded.${part.rounded}}`)] as [string, string]] : []),
    ...(part.height ? [['height', yamlString(`{spacing.${part.height}}`)] as [string, string]] : []),
    ...(part.padding ? [['padding', yamlString(`{spacing.${part.padding}}`)] as [string, string]] : []),
  ];
}

type Design = {
  preset: Preset;
  tokens: KosmosTokens;
  brand?: BrandColors;
  colors: Colors;
  components: ComponentSpec[];
};

function frontMatter({ preset, tokens, brand, colors, components }: Design): string {
  const lines = ['---', 'version: alpha', `name: ${yamlString(brand ? 'Kosmos UI' : `Kosmos ${preset.name}`)}`];
  lines.push(`description: ${yamlString(brand ? 'The design of the Kosmos UI site: the Default preset, and the brand color that only the site uses.' : preset.description)}`);
  lines.push('colors:');
  for (const token of Object.keys(colors.light) as ColorToken[]) {
    lines.push(`  ${token}: ${yamlString(colors.light[token]!)}`, `  ${darkName(token)}: ${yamlString(colors.dark[token]!)}`);
  }
  lines.push('typography:');
  for (const [name, role] of Object.entries(designTypography(preset, tokens))) {
    lines.push(
      `  ${name}:`,
      `    fontFamily: ${role.fontFamily}`,
      `    fontSize: ${role.fontSize}`,
      `    fontWeight: ${role.fontWeight}`,
      `    lineHeight: ${role.lineHeight}`,
      `    letterSpacing: ${role.letterSpacing}`,
    );
  }
  lines.push('rounded:', ...Object.entries(designRounded(preset, tokens)).map(([name, { value }]) => `  ${name}: ${value}`));
  lines.push('spacing:', ...Object.entries(designSpacing(preset)).map(([name, { value }]) => `  ${name}: ${value}`));
  lines.push('components:');
  for (const spec of components) {
    for (const mode of modes) {
      lines.push(`  ${mode === 'light' ? spec.name : darkName(spec.name)}:`);
      lines.push(...componentEntry(partOf(spec, mode), mode, colors).map(([key, value]) => `    ${key}: ${value}`));
    }
  }
  lines.push('---');
  return lines.join('\n');
}

const code = (value: string) => `\`${value}\``;

function colorTable(colors: Colors, tokens: readonly ColorToken[], use: (token: ColorToken) => string) {
  return [
    '| Token | Light | Dark | Use |',
    '| --- | --- | --- | --- |',
    ...tokens.map((token) => `| ${code(token)} | ${code(colors.light[token]!)} | ${code(colors.dark[token]!)} | ${use(token)} |`),
  ].join('\n');
}

function accentText({ accent }: Preset) {
  if (!accent) {
    return 'This preset has no accent: buttons and every checked control, focus, the current page in navigation and meters are ink, so color is left to status, destructive and the chart series. Keep every one of them ink.';
  }
  return `This preset's one accent fills every primary control (\`primary\`, \`sidebar-primary\`): the primary button, a checked checkbox or radio, a switch that is on, the slider range, the tabs indicator and a done step. It also colors focus (\`ring\`, \`sidebar-ring\`), the current page in navigation and the Meter's primary tone (\`accent-text\`). Nothing else takes it: links and every other text stay ink or gray.

| Step | Light | Dark | Use |
| --- | --- | --- | --- |
| Primary | ${code(accent.light.primary)} | ${code(accent.dark.primary)} | \`primary\` and \`sidebar-primary\`: a fill under \`primary-foreground\`. |
| On primary | ${code(accent.light.onPrimary)} | ${code(accent.dark.onPrimary)} | \`primary-foreground\`: 4.5:1 on the fill and under its 90% hover. White in both modes: in dark the fill is a deep step of the accent. |
| Ring | ${code(accent.light.ring)} | ${code(accent.dark.ring)} | Focus: a mark, 3:1 on every surface. |
| Text | ${code(accent.light.text)} | ${code(accent.dark.text)} | \`accent-text\`: 4.5:1 on every surface a nav item sits on. |`;
}

function overviewSection({ preset, brand }: Design) {
  const size = sizesOf(preset);
  const scope = preset.style
    ? 'It sets the palette, the radius and its own style: shadows, type weights, motion and the shape of the components. Fonts, text sizes and the size of every component stay the Kosmos ones.'
    : 'It sets the palette and the radius only: fonts, sizes, shadows and motion belong to the Kosmos style and stay the same under every preset.';
  const intro = brand
    ? `Kosmos UI is an open source design system for dashboard app UI: components and blocks distributed as a shadcn registry, with a docs site. This file describes the project as it looks: the Default preset, in which the site and every preview are built, plus the brand color that marks the site alone. Inside this repo the \`kosmos-style\` skill is the source of truth for agents and wins any conflict with this file.

${preset.description}`
    : `${preset.description}

This is a Kosmos UI preset. ${scope}`;
  return `## Overview

${intro}

The interface is calm and dense, made for dashboards read every day: white or near-white cards on a quiet page, text between 12 and 14px, ${size.button} buttons and ${size.field} text fields. Surfaces draw their edge with a layered shadow, not a border, and gray carries the hierarchy, so the one filled action in a view stands out. Every color is a CSS variable with its shadcn name, light on \`:root\` and dark on \`.dark\`, and components reach it through its Tailwind class (\`bg-card\`, \`text-muted-foreground\`, \`outline-ring\`), never a literal. Every value here is in the token block above; the sections below say where each one goes.`;
}

function colorsSection({ preset, brand, colors }: Design) {
  const palette = (tokens: readonly PaletteToken[]) => colorTable(colors, tokens, (token) => uses[token as PaletteToken]);
  const brandSection = brand
    ? `

### Brand color

The brand color is the identity of Kosmos UI as a product. It appears only on the site: the ring of the logo, the Pro marks (a primary button or badge filled with it) and text selection. It is the same in light and dark, white text passes 4.5:1 on it and on its hover, and it never enters the tokens a user installs: no registry item and no preset DESIGN.md holds it, and the build fails when one does.

${colorTable(colors, ['brand', 'brand-hover', 'brand-foreground'], (token) =>
  ({ brand: 'The logo ring and the fill of a Pro mark.', 'brand-hover': 'A Pro button under the pointer.', 'brand-foreground': 'Text on the brand fill.' })[token as 'brand'],
)}`
    : '';
  return `## Colors

Each color token has the Kosmos name, which is the shadcn name, for light, and the same name plus \`-dark\` for dark: \`card\` is \`bg-card\` on \`:root\`, \`card-dark\` the value of \`bg-card\` under \`.dark\`. Write the class, never the value. The values are the exact ones the CSS holds.

${palette(paletteSections.base)}
| ${code('primary-hover')} | ${code(colors.light['primary-hover']!)} | ${code(colors.dark['primary-hover']!)} | The primary fill under the pointer (\`bg-primary-hover\`): a step darker in light, the fill at 90% in dark. |

### Sidebar

${palette(paletteSections.sidebar)}

### Chart

The five chart series are the same under every preset and never take the accent. Use them in order, and give each series a legend or a label too.

${palette(paletteSections.chart)}

### Accent

${accentText(preset)}

### Status

\`success\`, \`warning\` and \`destructive\` color dots, icons, meter segments and fills. The text beside them stays \`foreground\` or \`muted-foreground\`, and a label, a value or an icon carries the meaning too, so it never rides on color alone. \`ring\` and the chart colors are made for 3:1 marks, never for text.${brandSection}`;
}

function typographySection({ preset, tokens }: Design) {
  const roles = designTypography(preset, tokens);
  const rows = (Object.keys(typeRoles) as TypeRole[]).map((name) => {
    const { fontSize, fontWeight, lineHeight: leading, letterSpacing } = roles[name];
    return `| ${code(`text-${name}`)} | ${px(remToPx(fontSize))} | ${leading} | ${fontWeight} | ${letterSpacing} | ${typeRoles[name]} |`;
  });
  const lighter = preset.style?.theme && Object.keys(preset.style.theme).some((token) => token.startsWith('text-'))
    ? ' This preset sets its own weights and tracking for some roles; the values below are its own.'
    : '';
  return `## Typography

The fonts are Geist Sans (\`font-sans\`, the \`Geist\` family) for all text and Geist Mono (\`font-mono\`) for code and keys. Each size is a type role, a Tailwind class that sets size, line height, weight and tracking together.${lighter}

| Role | Size | Line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

- Chrome is 500, content is 400. Buttons, tabs, segmented items, field labels and badges take \`font-medium\` (\`body-medium\`, \`caption-medium\`); table cells, descriptions, input values and prose stay 400, and so do menu items and sidebar items, since a long list reads quieter at the content weight.
- Hierarchy comes from weight and color (\`text-muted-foreground\`), not from more sizes.
- Eyebrows take \`text-caption uppercase tracking-[0.05em]\`, sidebar group labels \`text-caption uppercase tracking-[0.08em]\`.
- Numbers that change or line up (tables, stats, counters, timers, prices) take \`tabular-nums\`.
- Single-line text in a fixed-width slot takes \`truncate\`, multi-line text \`line-clamp-*\`. Prose measure is set in \`em\` (\`max-w-[40em]\`).
- Inputs render \`text-base sm:text-body\`, so a phone never zooms on focus.
- \`text-hero\` and \`text-lead\` are for marketing blocks only; an app screen uses \`text-display\` for a value, \`text-title\` for a title and \`text-body\` for text.`;
}

function layoutSection({ preset }: Design) {
  const spacing = designSpacing(preset);
  const size = sizeOf(preset);
  const sizeName = { compact: 'Compact', default: 'Default', comfortable: 'Comfortable' }[size];
  return `## Layout

This file is at the ${sizeName} size: the spacing unit is ${code(spacing.unit.value)}. Every height, padding and gap is a multiple of it, written in spacing units (\`h-7.5\`, \`px-2.5\`, \`gap-4\`), never in pixels, so the whole interface grows or shrinks with the size. Text sizes do not follow it.

| Token | Value | Use |
| --- | --- | --- |
${Object.entries(spacing).map(([name, { value, use }]) => `| ${code(name)} | ${code(value)} | ${use} |`).join('\n')}

- A field in a toolbar or beside a button takes the button's height (\`h-7.5\`); in a form it keeps its own, so a form reads calmer than its toolbar.
- Adjacent items in a list, menu or table are split by one 1px \`border-border\` line (\`divide-y divide-border\`, or \`border-b border-border last:border-b-0\`). A cell grid uses \`gap-px bg-border\` with \`bg-card\` on every cell.
- A sidebar docked beside the page is split from it by \`border-e border-sidebar-border\`; inside it, the header, every group after the first and the footer are split by full-width \`border-sidebar-border\` lines.
- Stat tiles are separate cards \`gap-4\` apart, or \`gap-1\` inside one tray as a strip of key numbers.
- Content that scrolls inside a frame (a dialog body, a menu, a sidebar, a board column) scrolls in a scroll area whose edges fade out, never with a bare \`overflow-auto\`.
- Every screen works at 375px wide: nothing scrolls the page sideways, text that grows with the data sits in a \`min-w-0\` child and wraps or truncates, numbers and dates never truncate, and full-height layouts take \`svh\`. A block sizes itself by its own width with container queries.
- Sticky chrome is opaque: \`bg-background\`, with a \`border-b border-border\` that shows once the page scrolls under it.`;
}

const surfaces: { token: string; surface: string }[] = [
  { token: 'shadow-control', surface: 'Secondary and destructive buttons, segmented groups, unticked checkboxes and radios, badges, the current sidebar item in dark' },
  { token: 'shadow-field', surface: 'Text fields: a ring with no drop, so it reads as a place to type' },
  { token: 'shadow-primary', surface: 'The primary button, beveled' },
  { token: 'shadow-primary-hover', surface: 'The primary button under the pointer' },
  { token: 'shadow-card', surface: 'Cards, stat tiles, board cards, a neutral alert' },
  { token: 'shadow-popover', surface: 'Popovers, menus, select lists, tooltips, toasts, the command palette' },
  { token: 'shadow-modal', surface: 'Dialogs and drawers' },
  { token: 'shadow-inset', surface: 'Sunken tracks: segmented, switch and meter' },
  { token: 'shadow-lift', surface: 'A card being dragged' },
  { token: 'shadow-thumb', surface: 'Switch and slider thumbs' },
];

function elevationSection({ preset, tokens }: Design) {
  const shadows = Object.fromEntries(modes.map((mode) => [mode, { ...tokens[mode], ...preset.style?.[mode] }])) as Record<Mode, Record<string, string>>;
  const own = preset.style
    ? `${preset.style.summary} The shadows below are this preset's own; they keep the Kosmos structure of a ring in light and a dark ring with a rim of light in dark.

`
    : '';
  return `## Elevation & Depth

${own}Surfaces draw their edge and depth with one layered shadow token, never a depth border. In light each shadow carries a 1px hairline ring; in dark each one carries a dark outer ring and a 1px inner rim of light, which is the Kosmos signature. The popover is the one exception in dark: its inner line is the \`input\` gray with no top rim, so a menu reads as a thin line inside a dark ring. Height rises from card to popover to dialog.

- Every element with a shadow ring also takes \`border border-transparent\`, so forced-colors mode, which drops box-shadow, still draws its edge.
- Real 1px borders are for dividers between items, the sidebar count pill and the outline alert, where the edge is part of the color, not depth.
- Overlay backdrops take \`bg-scrim\`. Content images take a 1px outline at black 10%, white 10% in dark, drawn inside.

| Token | Surface | Light | Dark |
| --- | --- | --- | --- |
${surfaces.map(({ token, surface }) => `| ${code(token)} | ${surface} | ${code(shadows.light[token])} | ${code(shadows.dark[token])} |`).join('\n')}`;
}

function shapesSection({ preset, tokens }: Design) {
  const size = sizesOf(preset);
  const rounded = designRounded(preset, tokens);
  const rules = preset.style?.css
    ? `

### This preset's rules

The components take these rules by their \`data-slot\`. Keep them after the tokens and outside any \`@layer\`: they hold the preset's shapes, and outside a layer they win over the Tailwind classes in the components, so a class you add for the same property loses under this preset. Buttons, text fields and tabs keep the Kosmos shape under every preset.

\`\`\`css
${cssRulesText(preset.style.css)}
\`\`\``
    : '';
  return `## Shapes

The radius base, \`--radius\`, is ${code(preset.radius)} (${rounded.control.value}). Every other step follows from it, so a 0 radius squares them all.

| Token | Value | Use |
| --- | --- | --- |
${Object.entries(rounded).map(([name, { value, use }]) => `| ${code(name)} | ${code(value)} | ${use} |`).join('\n')}

- A surface nested inside another with an even inset follows outer radius = inner radius + padding, written as a \`calc\` off the outer step so it stays concentric under every radius.
- A pill on an element that can grow tall (a vertical segmented control, an input group around a textarea) is capped at half a control's height, not \`9999px\`, or it turns into an oval.
- Icons are ${size.icon} in ${size.button} controls, ${size.rowIcon} in ${size.row} rows and large buttons, ${size.smallIcon} in small buttons and badges.${rules}`;
}

function componentsSection({ preset, colors, components }: Design) {
  const size = sizesOf(preset);
  const rows = components.flatMap((spec) =>
    modes.map((mode) => {
      const part = partOf(spec, mode);
      const name = mode === 'light' ? spec.name : darkName(spec.name);
      const fill = part.fill ? code(mode === 'light' ? part.fill : darkName(part.fill)) : 'none';
      const text = part.text ? code(mode === 'light' ? part.text : darkName(part.text)) : '';
      return `| ${code(name)} | ${spec.what} | ${fill} | ${text} | ${part.edge ? code(part.edge) : 'none'} |`;
    }),
  );
  const seeThroughParts = components.some((spec) => modes.some((mode) => seeThrough(partOf(spec, mode).fill && colors[mode][partOf(spec, mode).fill!])));
  return `## Components

The token block lists the components built most, each in light and, with \`-dark\`, in dark.${seeThroughParts ? ' A see-through hover fill is listed there without its text color, since it lays over the surface; the table below gives every fill and text.' : ''} Padding is the side padding.

| Component | What | Fill | Text | Edge |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

### Buttons

- Give each view one filled \`primary\` action; its peers take the secondary or ghost look. Icon buttons in headers and toolbars are secondary, a ${size.button} square.
- The destructive button is red text on the secondary surface, not a red fill.
- An enabled standalone button scales to 0.96 while pressed (\`motion-safe:active:scale-96\`). Buttons repeated in dense rows (menu items, nav items, table row actions, tabs) change their background only.
- Icons in secondary and ghost buttons are \`text-muted-foreground\`; the label stays \`text-foreground\`.

### Navigation

- Idle sidebar items, tabs, table headers, counts and field labels step back to \`text-muted-foreground\`; values and the selected tab stay \`text-foreground\`.
- The current page in navigation colors its label and icon \`text-accent-text\`${preset.accent ? ', the accent' : ', ink in this preset'}, on the flat hover fill (\`bg-sidebar-accent\` in the sidebar, \`bg-accent\` elsewhere) with no shadow. In dark the current sidebar item is raised instead: \`bg-muted\` with \`shadow-control\`.
- Menu and select items are ${size.button} rows with ${size.icon} icons; command items are ${size.row} rows with ${size.rowIcon} icons. Item icons are \`text-muted-foreground\`.

### Status and badges

- A state is a 6px dot beside its word, in the text color around it, with no pill. A status badge is the neutral pill plus a colored dot.
- A category, a plan or a code is a hue badge: a pale tint fill with its own darker text, no edge, the same under every preset. A category keeps one hue everywhere.
- An alert is tinted (info blue, success green, warning amber, destructive red) with a transparent border; the neutral one is a card.

### Focus

Every focusable element shows a 2px \`outline-ring\` outline, offset 2px (\`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring\`), so the shadow of its surface stays intact and an ink outline still reads around an ink button. Text fields light their own edge instead: a 1px \`ring\` line with a 3px \`ring\` halo at 20% (\`focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20\`), with a transparent outline that shows in forced-colors mode. An invalid field turns the line and halo \`destructive\`. \`ring\` keeps 3:1 against the page, cards, popovers and secondary surfaces in both modes, and \`sidebar-ring\` does the same on the sidebar. An element a scrolling container would clip draws its outline inside (\`-outline-offset-2\`).`;
}

function motionSection({ preset, tokens }: Design) {
  const theme = { ...tokens.theme, ...preset.style?.theme };
  const durations = ['instant', 'fast', 'base', 'overlay', 'slow'] as const;
  const own = preset.style?.theme && Object.keys(preset.style.theme).some((token) => /^(ease|transition-duration|default-transition)/.test(token))
    ? ' This preset sets its own durations and easing; the values below are its own.'
    : '';
  return `## Motion

Motion is quick and quiet: it shows where something came from and never delays the work.${own}

| Token | Value |
| --- | --- |
| ${code('ease-power3-out')} | ${code(theme['ease-power3-out'])} |
| ${code('ease-smooth-in-out')} | ${code(theme['ease-smooth-in-out'])} |
${durations.map((name) => `| ${code(`duration-${name}`)} | ${code(theme[`transition-duration-${name}`])} |`).join('\n')}

| Moment | Duration | Easing |
| --- | --- | --- |
| Hover, color, press | \`duration-fast\`; a menu item highlight \`duration-instant\` | \`ease-power3-out\` |
| Popover, menu, select, tooltip open | \`duration-base\` | \`ease-power3-out\` |
| Dialog open | \`duration-overlay\` | \`ease-power3-out\` |
| Drawer, sidebar resize, accordion height, sliding indicator, switch thumb | \`duration-slow\` | \`ease-smooth-in-out\` for size and position, \`ease-power3-out\` for slides |
| Any exit | \`duration-fast\` | \`ease-power3-out\` |

- A bare \`transition-[…]\` runs at ${theme['default-transition-duration']} on \`ease-power3-out\`, the theme default, so hover and color changes need no duration class. Transitions name the properties that change: \`transition-[background-color,box-shadow]\`.
- Exits run faster than enters, on the same curve and distance, reversed. The accordion closes as it opens.
- Popovers and menus enter from \`scale-[0.97]\` and \`opacity-0\`, growing from their trigger; dialogs enter from \`scale-95\` and \`opacity-0\`, centered. The command palette and anything opened by a keyboard shortcut appear without animation.
- Interactive state uses transitions, which reverse mid-flight; keyframes are for looping live states such as a skeleton pulse.
- Movement, scale and blur run only under \`motion-safe:\`. Under reduced motion the same change becomes an opacity cross-fade, never an instant jump.`;
}

function dosSection({ brand }: Design) {
  return `## Do's and Don'ts

- Do reach every color, shadow, radius, easing, duration and text size through its token (\`bg-card\`, \`shadow-popover\`, \`rounded-xl\`, \`text-body\`).
- Do give each view one filled \`primary\` action, and put only \`primary-foreground\` on a primary fill.
- Do keep text in \`foreground\` or \`muted-foreground\`. Both pass 4.5:1 on every surface.
- Do mark the current page in navigation with \`accent-text\`, on the flat \`accent\` hover fill.
- Do highlight hovered items with \`accent\`, the see-through fill that works on every surface.
- Do pair \`success\`, \`warning\` and \`destructive\` with a label or an icon, so the meaning never rides on color alone.
- Do use \`chart-1\` to \`chart-5\` in order, and fold a sixth series and beyond into "Other".
- Do draw a surface's edge with its shadow token and \`border border-transparent\`, and the line between items with \`border\`.
- Do size every part in spacing units, so the chosen size reaches it.
- Don't add a border to a card, a button, a field or an overlay for depth.
- Don't color text with \`ring\` or a chart color: they are made for 3:1 marks, not 4.5:1 text.
- Don't use \`accent-text\` for anything but the current page in navigation, a primary Meter and decorative glows and grids. Links stay ink.
- Don't fill a button or a large surface with \`ring\`: fills take \`primary\`.
- Don't let a hover take the \`ring\` color: that color means focus.
- Don't add a gray fainter than \`muted-foreground\` for text.
- Don't write a color literal in a component: every color goes through its token.
- Don't animate movement, scale or blur without a \`motion-safe:\` gate.${brand ? '\n- Don\'t use the brand color in a component, a block or a preset: it marks the site only.' : ''}`;
}

function designMd(design: Design): string {
  const title = design.brand ? '# Kosmos UI' : `# Kosmos ${design.preset.name} preset`;
  return `${[
    frontMatter(design),
    title,
    overviewSection(design),
    colorsSection(design),
    typographySection(design),
    layoutSection(design),
    elevationSection(design),
    shapesSection(design),
    componentsSection(design),
    motionSection(design),
    dosSection(design),
  ].join('\n\n')}\n`;
}

/** The DESIGN.md of a preset choice, in the Google Labs format: every token in light and dark, and the rules for using them. */
export function presetDesignMd(preset: Preset, tokens: KosmosTokens): string {
  return designMd({ preset, tokens, colors: designColors(preset), components: coreComponents });
}

/** The DESIGN.md of the Kosmos UI site: the default preset plus the brand color and where it appears. */
export function siteDesignMd(preset: Preset, tokens: KosmosTokens, brand: BrandColors): string {
  return designMd({ preset, tokens, brand, colors: designColors(preset, brand), components: [...coreComponents, ...brandComponents] });
}
