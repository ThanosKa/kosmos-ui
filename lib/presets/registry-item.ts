import { chosenPreset, choiceParams, type PresetChoice } from './choice.ts';
import { presetPalette, presetThemeTokens } from './palette.ts';

/** What a choice changes on its preset as it ships: what its address names. */
function changes(choice: PresetChoice) {
  const params = choiceParams(choice);
  return { accent: params.has('accent'), radius: params.has('radius'), size: params.has('size') };
}

/** The name of a choice's registry item: `preset-<id>` as the preset ships, then what the choice changes. */
export function presetItemName(choice: PresetChoice): string {
  const changed = changes(choice);
  return [
    `preset-${chosenPreset(choice).id}`,
    changed.accent ? (choice.accent ? '-accent' : '-no-accent') : '',
    changed.radius ? `-radius-${choice.radius}` : '',
    changed.size ? `-${choice.size}` : '',
  ].join('');
}

/**
 * A choice as a shadcn `registry:theme` item: the palette, radius and style it sets over the Kosmos tokens, the same
 * values `presetCss` writes. `shadcn add` installs the tokens first, so the preset's values win.
 */
export function presetRegistryItem(choice: PresetChoice) {
  const preset = chosenPreset(choice);
  const { style } = preset;
  const changed = changes(choice);
  const theme = presetThemeTokens(preset);
  const notes = [
    changed.accent ? `with its accent ${choice.accent ? 'on' : 'off'}` : '',
    changed.radius ? `with a ${choice.radius}px radius` : '',
    changed.size ? `at the ${choice.size} size` : '',
  ];
  const note = notes.filter(Boolean).join(' and ');
  const sets = [
    'the palette',
    'the radius',
    ...(preset.spacing ? ['the spacing'] : []),
    ...(style ? ['the shadows, type weights and motion', 'the shape of the components'] : []),
  ];
  const setsText = `${sets.slice(0, -1).join(', ')} and ${sets.at(-1)}`;
  return {
    name: presetItemName(choice),
    type: 'registry:theme' as const,
    title: `Kosmos ${preset.name} preset`,
    description: `${preset.description}${note ? ` Here ${note}.` : ''} Sets ${setsText} over the Kosmos tokens.`,
    registryDependencies: ['@kosmos/tokens'],
    cssVars: {
      ...(Object.keys(theme).length ? { theme } : {}),
      light: { radius: preset.radius, ...presetPalette(preset, 'light'), ...style?.light },
      dark: { ...presetPalette(preset, 'dark'), ...style?.dark },
    },
    ...(style?.css ? { css: style.css } : {}),
  };
}
