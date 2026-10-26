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

/**
 * The one color a preset brings, per mode (ADR 0011): `primary` fills every filled control and `onPrimary` is the text
 * on it (4.5:1, also under the 90% hover fill), `ring` is focus, the sidebar's focus and the first chart series (3:1
 * marks), `text` is the current page in navigation and the Meter's primary tone (4.5:1 on every nav surface).
 */
export type Accent = Record<Mode, { primary: string; onPrimary: string; ring: string; text: string }>;

/**
 * A ready set of palette and radius values. It never changes fonts, density or shadows (ADR 0009). The palette holds
 * the preset without its accent, ink where the accent would go (primary included), so the accent can be turned off.
 */
export type Preset = {
  id: string;
  name: string;
  /** One or two sentences on how the preset looks, for the Presets page and its DESIGN.md. */
  description: string;
  /** `--radius`, the base of the radius scale. */
  radius: string;
  accent?: Accent;
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
    'chart-1': accent.ring,
    'accent-text': accent.text,
  };
}
