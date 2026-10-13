import { readKosmosTokens, type Declarations, type KosmosTokens } from './tokens';

// Values come only from tokens.css; the copy here says when to use each token, and a token without copy throws.

export type Mode = 'light' | 'dark';
export const modes: Mode[] = ['light', 'dark'];
export const modeLabels: Record<Mode, string> = { light: 'Light', dark: 'Dark' };

function docsFor<T>(docs: Record<string, T>, name: string, kind: string): T {
  const entry = docs[name];
  if (!entry) throw new Error(`The ${kind} token "${name}" has no Foundations copy in lib/foundations.ts`);
  return entry;
}

/** A mode's declarations as a .dark page sees them: dark values over the light ones (`--radius` is light only). */
export function modeDeclarations(tokens: KosmosTokens, mode: Mode): Declarations {
  return mode === 'light' ? tokens.light : { ...tokens.light, ...tokens.dark };
}

/** Inline CSS variables that render a subtree in one mode whatever the page theme is. */
export function modeVars(tokens: KosmosTokens, mode: Mode) {
  return Object.fromEntries(
    Object.entries(modeDeclarations(tokens, mode)).map(([name, value]) => [`--${name}`, value]),
  ) as Record<`--${string}`, string>;
}

/** Replaces `var(--name)` with the value it holds, so a value can be drawn outside its mode. */
function resolveVars(value: string, declarations: Declarations): string {
  return value.replace(/var\(--([\w-]+)\)/g, (ref, name: string) =>
    name in declarations ? resolveVars(declarations[name], declarations) : ref,
  );
}

const rootFontSize = 16;

function toNumber(operand: string) {
  const match = /^(-?[\d.]+)(rem|px)?$/.exec(operand.trim());
  if (!match) throw new Error(`Can't read "${operand}" as a length`);
  return Number(match[1]) * (match[2] === 'rem' ? rootFontSize : 1);
}

/** A length in px, or a plain number: `0.75rem`, `1.4`, `calc(16 / 12)`, `calc(0.625rem - 6px)`. */
function evaluate(value: string): number {
  const calc = /^calc\((.+)\s([-+*/])\s(.+)\)$/.exec(value.trim());
  if (!calc) return toNumber(value);
  const [, a, operator, b] = calc;
  const [left, right] = [evaluate(a), evaluate(b)];
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  return left / right;
}

const px = (value: number) => `${Math.round(value * 100) / 100}px`;

export const colorGroups = {
  surfaces: 'Surfaces',
  text: 'Text',
  actions: 'Actions',
  status: 'Status',
  lines: 'Lines',
  sidebar: 'Sidebar',
  chart: 'Chart',
  tags: 'Tags',
} as const;
export type ColorGroup = keyof typeof colorGroups;

const colorDocs: Record<string, { group: ColorGroup; use: string }> = {
  background: { group: 'surfaces', use: 'The page.' },
  card: { group: 'surfaces', use: 'Cards, stat tiles and board cards.' },
  popover: { group: 'surfaces', use: 'Popovers, menus, tooltips, toasts, dialogs and drawers.' },
  muted: { group: 'surfaces', use: 'Tracks and quiet fills: segmented control, switch, meter.' },
  scrim: { group: 'surfaces', use: 'The backdrop behind dialogs and drawers.' },
  thumb: { group: 'surfaces', use: 'Switch and slider thumbs, light in both modes.' },
  'scrollbar-thumb': { group: 'surfaces', use: 'The scrollbar thumb of a scroll area, lighter than muted text.' },
  'meter-primary': { group: 'status', use: 'The Meter in its primary tone: the orange, a step deeper in light so it never matches warning.' },
  foreground: { group: 'text', use: 'Text on the page: headings, values, a hovered item.' },
  'card-foreground': { group: 'text', use: 'Text on a card.' },
  'popover-foreground': { group: 'text', use: 'Text in a popover, menu or dialog.' },
  'muted-foreground': {
    group: 'text',
    use: 'Secondary text and idle chrome: descriptions, labels, table headers, counts. The faintest text that still reads.',
  },
  'active-foreground': {
    group: 'text',
    use: 'The orange label and icon of the current page in navigation: the active sidebar item, the current header tab and the current item in a nav menu. The only orange text.',
  },
  primary: { group: 'actions', use: 'The one filled action per view, a checked checkbox, a switch that is on.' },
  'primary-foreground': { group: 'actions', use: 'Text and icons on a primary fill.' },
  secondary: { group: 'actions', use: 'Secondary buttons and text fields.' },
  'secondary-foreground': { group: 'actions', use: 'Text on a secondary button.' },
  accent: { group: 'actions', use: 'The see-through hover on ghost buttons, nav items, menu items and rows.' },
  'accent-foreground': { group: 'actions', use: 'Text on a hovered item, for components from other shadcn registries.' },
  destructive: { group: 'status', use: 'Destructive actions and errors.' },
  success: { group: 'status', use: 'Status dots, icons and meter segments that mean done or healthy.' },
  warning: { group: 'status', use: 'Status dots, icons and meter segments that need attention.' },
  border: { group: 'lines', use: 'Dividers between list, menu and table items.' },
  input: { group: 'lines', use: 'The edge of a text field, drawn as a ring by shadow-field.' },
  ring: { group: 'lines', use: 'Focus outlines, and the orange accent. Never text: orange text takes active-foreground.' },
  sidebar: { group: 'sidebar', use: 'The sidebar surface.' },
  'sidebar-foreground': { group: 'sidebar', use: 'Sidebar text and a hovered sidebar item.' },
  'sidebar-primary': { group: 'sidebar', use: 'A filled mark in the sidebar, like the workspace initial.' },
  'sidebar-primary-foreground': { group: 'sidebar', use: 'Text on a sidebar-primary fill.' },
  'sidebar-accent': { group: 'sidebar', use: 'The hover on sidebar items.' },
  'sidebar-accent-foreground': { group: 'sidebar', use: 'Text on a hovered sidebar item, for components from other shadcn registries.' },
  'sidebar-border': { group: 'sidebar', use: 'The line between the sidebar and the page, and between its groups.' },
  'sidebar-ring': { group: 'sidebar', use: 'Focus outlines inside the sidebar.' },
  'chart-1': { group: 'chart', use: 'The first chart series.' },
  'chart-2': { group: 'chart', use: 'The second chart series.' },
  'chart-3': { group: 'chart', use: 'The third chart series.' },
  'chart-4': { group: 'chart', use: 'The fourth chart series.' },
  'chart-5': { group: 'chart', use: 'The fifth chart series. More than five fold into "Other".' },
  'tag-orange': { group: 'tags', use: 'The fill of an orange tag.' },
  'tag-orange-foreground': { group: 'tags', use: 'The text of an orange tag, and its edge at 20%.' },
  'tag-blue': { group: 'tags', use: 'The fill of a blue tag.' },
  'tag-blue-foreground': { group: 'tags', use: 'The text of a blue tag, and its edge at 20%.' },
  'tag-amber': { group: 'tags', use: 'The fill of an amber tag.' },
  'tag-amber-foreground': { group: 'tags', use: 'The text of an amber tag, and its edge at 20%.' },
  'tag-magenta': { group: 'tags', use: 'The fill of a magenta tag.' },
  'tag-magenta-foreground': { group: 'tags', use: 'The text of a magenta tag, and its edge at 20%.' },
  'tag-green': { group: 'tags', use: 'The fill of a green tag, and the rise in a stat tile.' },
  'tag-green-foreground': { group: 'tags', use: 'The text of a green tag, and its edge at 20%.' },
  'tag-red': { group: 'tags', use: 'The fill of a red tag, and the drop in a stat tile.' },
  'tag-red-foreground': { group: 'tags', use: 'The text of a red tag, and its edge at 20%.' },
};

/** The Tailwind class a token is mostly used through. */
function colorClass(name: string) {
  if (name === 'foreground' || name === 'destructive' || name.endsWith('-foreground')) return `text-${name}`;
  if (name === 'border' || name === 'input' || name.endsWith('-border')) return `border-${name}`;
  if (name === 'ring' || name.endsWith('-ring')) return `outline-${name}`;
  return `bg-${name}`;
}

export function colorTokens() {
  const tokens = readKosmosTokens();
  const light = modeDeclarations(tokens, 'light');
  const dark = modeDeclarations(tokens, 'dark');
  return Object.keys(tokens.light)
    .filter((name) => `color-${name}` in tokens.themeInline)
    .map((name) => ({
      name,
      className: colorClass(name),
      ...docsFor(colorDocs, name, 'color'),
      value: { light: light[name], dark: dark[name] },
      resolved: {
        light: { color: resolveVars(light[name], light), background: resolveVars(light.background, light), line: resolveVars(light.border, light) },
        dark: { color: resolveVars(dark[name], dark), background: resolveVars(dark.background, dark), line: resolveVars(dark.border, dark) },
      },
    }));
}

const typeDocs: Record<string, string> = {
  caption: 'Meta, badges, keyboard hints, table headers, and eyebrows in uppercase.',
  small: 'Descriptions, hints, errors, menu shortcuts, and field labels above a control.',
  body: 'The default UI text: buttons, menu items, table cells, checkbox and switch labels.',
  title: 'Dialog, drawer and card titles. Page titles in app chrome take it at medium weight.',
  heading: 'Section headings on pages outside the app, such as these docs.',
  display: 'Stat values, always with tabular-nums. Also the title of a marketing hero in a narrow container.',
  hero: 'The title of a marketing hero, once its container is 672px wide.',
  lead: 'The one line under a marketing hero title.',
};

export function typeRoles() {
  const tokens = readKosmosTokens();
  return Object.keys(tokens.theme)
    .filter((name) => name.startsWith('text-') && !name.includes('--'))
    .map((name) => {
      const role = name.replace('text-', '');
      const size = tokens.theme[name];
      const lineHeight = tokens.theme[`${name}--line-height`];
      const sizePx = evaluate(size);
      const lineHeightValue = evaluate(lineHeight);
      return {
        role,
        className: name,
        use: docsFor(typeDocs, role, 'type'),
        size,
        sizePx: px(sizePx),
        lineHeight,
        lineHeightPx: px(/(px|rem)/.test(lineHeight) ? lineHeightValue : lineHeightValue * sizePx),
        weight: tokens.theme[`${name}--font-weight`] ?? '400',
        tracking: tokens.theme[`${name}--letter-spacing`] ?? '0em',
      };
    });
}

const shadowDocs: Record<string, { fill: string; surface: string }> = {
  'shadow-control': { fill: 'bg-secondary', surface: 'Secondary buttons, the segmented group, the active sidebar item.' },
  'shadow-primary': { fill: 'bg-primary', surface: 'The primary button. Flat in light, raised in dark.' },
  'shadow-card': { fill: 'bg-card', surface: 'Cards, stat tiles and board cards.' },
  'shadow-popover': { fill: 'bg-popover', surface: 'Popovers, menus, select lists, tooltips, toasts and the command palette.' },
  'shadow-modal': { fill: 'bg-popover', surface: 'Dialogs and drawers.' },
  'shadow-inset': { fill: 'bg-muted', surface: 'Tracks: the segmented control, switch and meter.' },
  'shadow-lift': { fill: 'bg-card', surface: 'A card while it is dragged.' },
  'shadow-thumb': { fill: 'bg-thumb', surface: 'Switch and slider thumbs.' },
  'shadow-field': { fill: 'bg-secondary', surface: 'Inputs, textareas and select triggers: a ring with no drop.' },
};

export function shadowTokens() {
  const tokens = readKosmosTokens();
  const dark = modeDeclarations(tokens, 'dark');
  return Object.keys(tokens.light)
    .filter((name) => name.startsWith('shadow-'))
    .map((name) => ({
      name,
      ...docsFor(shadowDocs, name, 'shadow'),
      value: { light: tokens.light[name], dark: dark[name] },
    }));
}

const radiusDocs: Record<string, string> = {
  'radius-sm': 'The checkbox and keyboard keys.',
  'radius-md': 'Segmented items inside their track.',
  'radius-lg': 'Controls, menu items and tooltips.',
  'radius-xl': 'Overlays: popovers, menus, dialogs.',
  'radius-2xl': 'Cards.',
  'radius-3xl': 'The top of a bottom sheet.',
};

export function radiusScale() {
  const tokens = readKosmosTokens();
  return Object.keys(tokens.themeInline)
    .filter((name) => name.startsWith('radius-'))
    .map((name) => ({
      name,
      className: name.replace('radius-', 'rounded-'),
      use: docsFor(radiusDocs, name, 'radius'),
      value: tokens.themeInline[name],
      px: px(evaluate(resolveVars(tokens.themeInline[name], tokens.light))),
    }));
}

const motionDocs: Record<string, string> = {
  'transition-duration-instant': 'Menu and list item highlight.',
  'transition-duration-fast': 'Hover, color, press, and every exit.',
  'transition-duration-base': 'Popover, menu, select and tooltip open.',
  'transition-duration-overlay': 'Dialog open.',
  'transition-duration-slow': 'Drawer, sidebar width, accordion height, tab indicator, switch thumb.',
  'ease-power3-out': 'The default curve for everything.',
  'ease-smooth-in-out': 'Size and position: sidebar width, accordion height, indicators, switch thumb.',
  'default-transition-duration': 'Any transition without a duration class.',
  'default-transition-timing-function': 'Any transition without an easing class.',
};

function parseBezier(value: string) {
  return (/cubic-bezier\(([^)]+)\)/.exec(value)?.[1] ?? '').split(',').map((part) => Number(part.trim()));
}

export function easings() {
  const tokens = readKosmosTokens();
  return Object.entries(tokens.theme)
    .filter(([name]) => name.startsWith('ease-'))
    .map(([name, value]) => ({ name: name.replace('ease-', ''), value, bezier: parseBezier(value) }));
}

/** Durations, then easings, then Tailwind's defaults, in that order. */
export function motionTokens() {
  const tokens = readKosmosTokens();
  const row = (name: string, className: string) => ({
    name,
    className,
    value: tokens.theme[name],
    use: docsFor(motionDocs, name, 'motion'),
  });
  const names = Object.keys(tokens.theme);
  return [
    ...names.filter((name) => name.startsWith('transition-duration-')).map((name) => row(name, name.replace('transition-', ''))),
    ...names.filter((name) => name.startsWith('ease-')).map((name) => row(name, name)),
    ...names.filter((name) => name.startsWith('default-transition-')).map((name) => row(name, `--${name}`)),
  ];
}
