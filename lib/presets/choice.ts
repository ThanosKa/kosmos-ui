import { presets } from './list.ts';
import type { Preset } from './palette.ts';

/**
 * What a visitor picks on the Presets page and the landing dashboard: a preset, whether its accent is on, and the
 * radius in pixels. The theme is not part of it: a preset always ships both modes.
 */
export type PresetChoice = { preset: string; accent: boolean; radius: string };

/** The radii the picker offers, in pixels: square, and each preset's own. */
export const presetRadii = ['0', '6', '8', '10', '16'] as const;

const pixels = (radius: string) => String(Number.parseFloat(radius) * 16);
const rem = (radius: string) => `${Number(radius) / 16}rem`;
/** The preset with this id, or the default when there is none. */
export const presetById = (id: string | null): Preset => presets.find((preset) => preset.id === id) ?? presets[0];

/** The preset as it ships: its accent on, its own radius. */
export function defaultChoice(preset: Preset = presets[0]): PresetChoice {
  return { preset: preset.id, accent: preset.accent !== undefined, radius: pixels(preset.radius) };
}

/** The preset a choice makes, which its preview, CSS, registry item and DESIGN.md are all written from. */
export function chosenPreset(choice: PresetChoice): Preset {
  const preset = presetById(choice.preset);
  return { ...preset, accent: choice.accent ? preset.accent : undefined, radius: rem(choice.radius) };
}

/** The search params of a choice, leaving out what the preset already has, so the Default as it ships has none. */
export function choiceParams(choice: PresetChoice): URLSearchParams {
  const preset = presetById(choice.preset);
  const shipped = defaultChoice(preset);
  const params = new URLSearchParams();
  if (preset !== presets[0]) params.set('preset', preset.id);
  if (choice.accent !== shipped.accent) params.set('accent', choice.accent ? 'on' : 'off');
  if (choice.radius !== shipped.radius) params.set('radius', choice.radius);
  return params;
}

/** The choice a URL names. A value the picker does not offer falls back to the preset as it ships. */
export function choiceFromParams(params: URLSearchParams): PresetChoice {
  const preset = presetById(params.get('preset'));
  const choice = defaultChoice(preset);
  if (preset.accent && params.get('accent') === 'off') choice.accent = false;
  const radius = presetRadii.find((value) => value === params.get('radius'));
  if (radius) choice.radius = radius;
  return choice;
}

/** Every choice the picker offers, one registry item each. */
export function presetChoices(): PresetChoice[] {
  return presets.flatMap((preset) =>
    (preset.accent ? [true, false] : [false]).flatMap((accent) => presetRadii.map((radius) => ({ preset: preset.id, accent, radius }))),
  );
}
