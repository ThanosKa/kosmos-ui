import { choiceFromParams, choiceParams, chosenPreset, presetRuntimeCss, type PresetChoice } from './presets/index.ts';

/*
 * The preset a visitor picks applies to the whole site: every page and every preview iframe on it. The choice is kept
 * in localStorage with the CSS it makes, so an inline script in each document's head writes that CSS before the first
 * paint, and a storage event carries a change to the site's other documents (its iframes, other tabs) at once.
 */

export const sitePresetKey = 'kosmos-preset';
export const sitePresetStyleId = 'site-preset';

/** What localStorage holds: the choice as its search params, and the CSS it makes. */
export type StoredPreset = { choice: string; css: string };

/** The CSS the site applies for a choice. The Default as it ships needs none: it is the tokens. */
export function sitePresetCss(choice: PresetChoice): string {
  if (choiceParams(choice).size === 0) return '';
  return presetRuntimeCss(chosenPreset(choice));
}

export function storedPreset(choice: PresetChoice): StoredPreset {
  return { choice: choiceParams(choice).toString(), css: sitePresetCss(choice) };
}

/** The choice a stored value names; anything unreadable is the Default. */
export function readStoredChoice(value: string | null): PresetChoice {
  try {
    const stored = JSON.parse(value ?? '') as Partial<StoredPreset>;
    return choiceFromParams(new URLSearchParams(typeof stored.choice === 'string' ? stored.choice : ''));
  } catch {
    return choiceFromParams(new URLSearchParams());
  }
}

/**
 * The inline script each document runs in its head: it writes the stored CSS before anything paints. It can't import
 * the presets module, so it trusts the stored CSS; the page checks it against the choice once it hydrates.
 */
export const sitePresetScript = `(()=>{try{const v=JSON.parse(localStorage.getItem(${JSON.stringify(sitePresetKey)})||'null');if(v&&typeof v.css==='string'&&v.css){const s=document.createElement('style');s.id=${JSON.stringify(sitePresetStyleId)};s.textContent=v.css;document.head.appendChild(s)}}catch(e){}})()`;

/**
 * The inline script of a shared link to the Presets page: it keeps the choice the address names and writes its CSS,
 * so the page paints in that preset the first time, before it hydrates.
 */
export function sharedPresetScript(choice: PresetChoice): string {
  const stored = JSON.stringify(JSON.stringify(storedPreset(choice)));
  const css = JSON.stringify(sitePresetCss(choice));
  const id = JSON.stringify(sitePresetStyleId);
  return `(()=>{try{localStorage.setItem(${JSON.stringify(sitePresetKey)},${stored})}catch(e){}const s=document.getElementById(${id})||document.head.appendChild(Object.assign(document.createElement('style'),{id:${id}}));s.textContent=${css}})()`;
}
