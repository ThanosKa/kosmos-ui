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
    'active-foreground',
    'scrim',
    'thumb',
    'scrollbar-thumb',
    'meter-primary',
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

/** A ready set of palette and radius values. It never changes fonts, density or shadows (ADR 0009). */
export type Preset = {
  id: string;
  name: string;
  /** One or two sentences on how the preset looks, for the Presets page and its DESIGN.md. */
  description: string;
  /** `--radius`, the base of the radius scale. */
  radius: string;
} & Record<Mode, Palette>;
