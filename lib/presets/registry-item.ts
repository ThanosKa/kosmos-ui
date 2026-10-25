import { chosenPreset, choiceParams, type PresetChoice } from './choice.ts';
import { presetPalette } from './palette.ts';

/** What a choice changes on its preset as it ships: what its address names. */
function changes(choice: PresetChoice) {
  const params = choiceParams(choice);
  return { accent: params.has('accent'), radius: params.has('radius') };
}

/** The name of a choice's registry item: `preset-<id>` as the preset ships, then what the choice changes. */
export function presetItemName(choice: PresetChoice): string {
  const changed = changes(choice);
  return [
    `preset-${chosenPreset(choice).id}`,
    changed.accent ? (choice.accent ? '-accent' : '-no-accent') : '',
    changed.radius ? `-radius-${choice.radius}` : '',
  ].join('');
}

/**
 * A choice as a shadcn `registry:theme` item: the palette and radius it sets over the Kosmos tokens, the same values
 * `presetCss` writes. `shadcn add` installs the tokens first, so the preset's values win.
 */
export function presetRegistryItem(choice: PresetChoice) {
  const preset = chosenPreset(choice);
  const changed = changes(choice);
  const notes = [changed.accent ? `with its accent ${choice.accent ? 'on' : 'off'}` : '', changed.radius ? `with a ${choice.radius}px radius` : ''];
  const note = notes.filter(Boolean).join(' and ');
  return {
    name: presetItemName(choice),
    type: 'registry:theme' as const,
    title: `Kosmos ${preset.name} preset`,
    description: `${preset.description}${note ? ` Here ${note}.` : ''} Sets the palette and the radius over the Kosmos tokens.`,
    registryDependencies: ['@kosmos/tokens'],
    cssVars: {
      light: { radius: preset.radius, ...presetPalette(preset, 'light') },
      dark: presetPalette(preset, 'dark'),
    },
  };
}
