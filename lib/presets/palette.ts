/** The palette tokens a preset sets, in the order its CSS writes them, one blank line between sections. */
export const paletteSections = {
  base: [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'success',
    'warning',
    'border',
    'input',
    'ring',
    'accent-text',
    'scrim',
    'thumb',
    'scrollbar-thumb',
  ],
  sidebar: [
    'sidebar',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
  ],
  chart: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
} as const;

export type PaletteToken = (typeof paletteSections)[keyof typeof paletteSections][number];
export type Palette = Record<PaletteToken, string>;
export type Mode = 'light' | 'dark';

type ChartToken = (typeof paletteSections.chart)[number];

/**
 * The five chart series, the same under every preset (ADR 0016): blue, orange, green, purple, yellow. Dark takes the
 * maintainer's colors as given; light keeps their blue and purple and darkens the orange, green and yellow to 3:1 on
 * every preset's page and card. The order keeps neighbors apart for color-blind readers.
 */
export const chartColors: Record<Mode, Record<ChartToken, string>> = {
  light: {
    'chart-1': 'oklch(0.602 0.201 255.8)',
    'chart-2': 'oklch(0.65 0.188 47)',
    'chart-3': 'oklch(0.62 0.17 149)',
    'chart-4': 'oklch(0.588 0.28 303.8)',
    'chart-5': 'oklch(0.63 0.135 81)',
  },
  dark: {
    'chart-1': 'oklch(0.668 0.167 252.2)',
    'chart-2': 'oklch(0.708 0.188 47)',
    'chart-3': 'oklch(0.646 0.177 149.1)',
    'chart-4': 'oklch(0.648 0.241 306.1)',
    'chart-5': 'oklch(0.834 0.153 81.1)',
  },
};

/**
 * The one color a preset brings, per mode (ADR 0011): `primary` fills every filled control and `onPrimary` is the text
 * on it (4.5:1, also under the 90% hover fill), `ring` is focus and the sidebar's focus (3:1 marks), `text` is the
 * current page in navigation and the Meter's primary tone (4.5:1 on every nav surface).
 */
export type Accent = Record<Mode, { primary: string; onPrimary: string; ring: string; text: string }>;

/** CSS rules as shadcn's registry `css` field writes them: a selector or at-rule, then declarations or nested rules. */
export type CssRules = { [selector: string]: { [property: string]: string } | CssRules };

/**
 * How a preset changes the components beyond color (ADR 0014). `theme` holds Kosmos tokens equal in both modes (type
 * weights and tracking, durations, easings), `light` and `dark` the mode tokens (shadows), and `css` the rules that
 * reshape components by their `data-slot`. A style never sizes anything: spacing, text sizes, line heights, heights,
 * padding and gaps stay the Kosmos ones, and the size is the visitor's choice. A variable only a preset's rules read is
 * declared in `css`, on `:root` and `.dark`, and named after the preset (`--console-raise`).
 */
export type PresetStyle = {
  /** What the style changes, in a few sentences, for the Presets page and the DESIGN.md. */
  summary: string;
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
  css?: CssRules;
};

/**
 * A ready set of palette and radius values, and for a preset with a `style`, its own shadows, type weights, motion and
 * component shapes (ADR 0014). Fonts stay Geist under every preset. The palette holds the preset without its accent,
 * ink where the accent would go (primary included), so the accent can be turned off.
 */
export type Preset = {
  id: string;
  name: string;
  /** One or two sentences on how the preset looks, for the Presets page and its DESIGN.md. */
  description: string;
  /** `--radius`, the base of the radius scale. */
  radius: string;
  /** `--spacing`, the unit of every height, padding and gap, when the chosen size is not the Kosmos 0.25rem. */
  spacing?: string;
  accent?: Accent;
  style?: PresetStyle;
} & Record<Mode, Palette>;

/** The palette of one mode with the preset's accent in place, as its CSS writes it. */
export function presetPalette(preset: Preset, mode: Mode): Palette {
  const accent = preset.accent?.[mode];
  if (!accent) return preset[mode];
  return {
    ...preset[mode],
    primary: accent.primary,
    'primary-foreground': accent.onPrimary,
    'sidebar-primary': accent.primary,
    'sidebar-primary-foreground': accent.onPrimary,
    ring: accent.ring,
    'sidebar-ring': accent.ring,
    'accent-text': accent.text,
  };
}

/** The tokens a preset sets equal in both modes: the chosen size's spacing, then its style's. */
export function presetThemeTokens(preset: Preset): Record<string, string> {
  return { ...(preset.spacing ? { spacing: preset.spacing } : {}), ...preset.style?.theme };
}
