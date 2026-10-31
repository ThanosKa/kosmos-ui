import { presets } from './list.ts';
import type { Preset } from './palette.ts';

/** How much room the components take: every height, padding and gap scales with `--spacing`, text sizes stay. */
export type PresetSize = 'compact' | 'default' | 'comfortable';

/** The `--spacing` of each size: 88%, the Kosmos 0.25rem, and 112%. */
export const presetSizes: Record<PresetSize, string> = { compact: '0.22rem', default: '0.25rem', comfortable: '0.28rem' };

/**
 * What a visitor picks on the Presets page and the landing dashboard: a preset, whether its accent is on, the radius in
 * pixels and the size. The theme is not part of it: a preset always ships both modes.
 */
export type PresetChoice = { preset: string; accent: boolean; radius: string; size: PresetSize };

/** The radii the picker offers, in pixels: square, and each preset's own. */
export const presetRadii = ['0', '6', '8', '10', '16'] as const;

const pixels = (radius: string) => String(Number.parseFloat(radius) * 16);
const rem = (radius: string) => `${Number(radius) / 16}rem`;
const isSize = (value: string | null): value is PresetSize => value !== null && Object.hasOwn(presetSizes, value);
/** The preset with this id, or the default when there is none. */
export const presetById = (id: string | null): Preset => presets.find((preset) => preset.id === id) ?? presets[0];

/** The preset as it ships: its accent on, its own radius, the default size. */
export function defaultChoice(preset: Preset = presets[0]): PresetChoice {
  return { preset: preset.id, accent: preset.accent !== undefined, radius: pixels(preset.radius), size: 'default' };
}

/** The preset a choice makes, which its preview, CSS, registry item and DESIGN.md are all written from. */
export function chosenPreset(choice: PresetChoice): Preset {
  const preset = presetById(choice.preset);
  return {
    ...preset,
    accent: choice.accent ? preset.accent : undefined,
    radius: rem(choice.radius),
    spacing: choice.size === 'default' ? undefined : presetSizes[choice.size],
  };
}

/** The search params of a choice, leaving out what the preset already has, so the Default as it ships has none. */
export function choiceParams(choice: PresetChoice): URLSearchParams {
  const preset = presetById(choice.preset);
  const shipped = defaultChoice(preset);
  const params = new URLSearchParams();
  if (preset !== presets[0]) params.set('preset', preset.id);
  if (choice.accent !== shipped.accent) params.set('accent', choice.accent ? 'on' : 'off');
  if (choice.radius !== shipped.radius) params.set('radius', choice.radius);
  if (choice.size !== shipped.size) params.set('size', choice.size);
  return params;
}

/** The choice a URL names. A value the picker does not offer falls back to the preset as it ships. */
export function choiceFromParams(params: URLSearchParams): PresetChoice {
  const preset = presetById(params.get('preset'));
  const choice = defaultChoice(preset);
  if (preset.accent && params.get('accent') === 'off') choice.accent = false;
  const radius = presetRadii.find((value) => value === params.get('radius'));
  if (radius) choice.radius = radius;
  const size = params.get('size');
  if (isSize(size)) choice.size = size;
  return choice;
}

/** Every choice the picker offers, one registry item each. */
export function presetChoices(): PresetChoice[] {
  const sizes = Object.keys(presetSizes) as PresetSize[];
  return presets.flatMap((preset) =>
    (preset.accent ? [true, false] : [false]).flatMap((accent) =>
      presetRadii.flatMap((radius) => sizes.map((size) => ({ preset: preset.id, accent, radius, size }))),
    ),
  );
}
