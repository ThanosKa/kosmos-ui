import { defaultPreset } from './default.ts';
import { paletteSections, presetPalette, type Palette, type Preset } from './palette.ts';

export { defaultPreset, presetPalette };
export { presets } from './list.ts';
export { chosenPreset, choiceFromParams, choiceParams, defaultChoice, presetById, presetChoices, presetRadii, type PresetChoice } from './choice.ts';
export { presetDesignMd } from './design-md.ts';
export { presetItemName, presetRegistryItem } from './registry-item.ts';
export type { Accent, Mode, Palette, PaletteToken, Preset } from './palette.ts';

const declarations = (palette: Palette) =>
  Object.values(paletteSections).map((tokens) => tokens.map((token) => `  --${token}: ${palette[token]};`).join('\n'));

/** The preset as CSS a project pastes over its tokens: `:root` for light and `.dark` for dark, the accent in place. */
export function presetCss(preset: Preset): string {
  const light = [`  --radius: ${preset.radius};`, ...declarations(presetPalette(preset, 'light'))].join('\n\n');
  const dark = declarations(presetPalette(preset, 'dark')).join('\n\n');
  return `:root {\n${light}\n}\n\n.dark {\n${dark}\n}\n`;
}
