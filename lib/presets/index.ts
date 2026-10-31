import { cssRulesText } from './css.ts';
import { defaultPreset } from './default.ts';
import { paletteSections, presetPalette, presetThemeTokens, type Palette, type Preset } from './palette.ts';

export { defaultPreset, presetPalette };
export { presets } from './list.ts';
export {
  chosenPreset,
  choiceFromParams,
  choiceParams,
  defaultChoice,
  presetById,
  presetChoices,
  presetRadii,
  presetSizes,
  type PresetChoice,
  type PresetSize,
} from './choice.ts';
export { presetDesignMd } from './design-md.ts';
export { presetItemName, presetRegistryItem } from './registry-item.ts';
export type { Accent, CssRules, Mode, Palette, PaletteToken, Preset, PresetStyle } from './palette.ts';

const declarations = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([token, value]) => `  --${token}: ${value};`)
    .join('\n');

const paletteDeclarations = (palette: Palette) =>
  Object.values(paletteSections).map((tokens) => declarations(Object.fromEntries(tokens.map((token) => [token, palette[token]]))));

/** The blocks a preset's CSS is written from: mode-free tokens, light and dark, and the component rules. */
function presetBlocks(preset: Preset) {
  const { style } = preset;
  const section = (values?: Record<string, string>) => (values && Object.keys(values).length ? [declarations(values)] : []);
  return {
    theme: section(presetThemeTokens(preset)),
    light: [`  --radius: ${preset.radius};`, ...paletteDeclarations(presetPalette(preset, 'light')), ...section(style?.light)],
    dark: [...paletteDeclarations(presetPalette(preset, 'dark')), ...section(style?.dark)],
    rules: style?.css ? cssRulesText(style.css) : '',
  };
}

/**
 * The preset as CSS a project pastes over its tokens: tokens equal in both modes in `@theme inline` (Tailwind
 * writes them into the utilities), `:root` for light and `.dark` for dark with the accent in place, then the component
 * rules.
 */
export function presetCss(preset: Preset): string {
  const { theme, light, dark, rules } = presetBlocks(preset);
  return [
    ...(theme.length ? [`@theme inline {\n${theme.join('\n\n')}\n}\n`] : []),
    `:root {\n${light.join('\n\n')}\n}\n`,
    `.dark {\n${dark.join('\n\n')}\n}\n`,
    ...(rules ? [`${rules}\n`] : []),
  ].join('\n');
}

/**
 * The preset as the site applies it at runtime: the same values, with the mode-free tokens on `html:root`, where
 * the site's own theme reads them through `var()`, and selectors raised to `html:root` and `html.dark` so they win over
 * the tokens wherever the stylesheets land in the head.
 */
export function presetRuntimeCss(preset: Preset): string {
  const { theme, light, dark, rules } = presetBlocks(preset);
  return [
    `html:root {\n${[...light, ...theme].join('\n\n')}\n}\n`,
    `html.dark {\n${dark.join('\n\n')}\n}\n`,
    ...(rules ? [`${rules}\n`] : []),
  ].join('\n');
}
