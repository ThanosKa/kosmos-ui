import { paletteSections, type Palette, type Preset } from './palette.ts';
import { warm } from './warm.ts';

export { presetDesignMd } from './design-md.ts';
export type { Mode, Palette, PaletteToken, Preset } from './palette.ts';

/** Every preset, the default first. */
export const presets: readonly Preset[] = [warm];

export const defaultPreset = presets[0];

const declarations = (palette: Palette) =>
  Object.values(paletteSections).map((tokens) => tokens.map((token) => `  --${token}: ${palette[token]};`).join('\n'));

/** The preset as CSS a project pastes over its tokens: `:root` for light and `.dark` for dark. */
export function presetCss(preset: Preset): string {
  const light = [`  --radius: ${preset.radius};`, ...declarations(preset.light)].join('\n\n');
  const dark = declarations(preset.dark).join('\n\n');
  return `:root {\n${light}\n}\n\n.dark {\n${dark}\n}\n`;
}
