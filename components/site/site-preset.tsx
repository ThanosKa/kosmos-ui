'use client';

import * as React from 'react';
import type { PresetChoice } from '@/lib/presets';
import { readStoredChoice, sitePresetCss, sitePresetKey, sitePresetScript, sitePresetStyleId, storedPreset } from '@/lib/site-preset';

const changeEvent = 'kosmos:preset';
/** The stored value for this page view when storage is blocked. */
let unsaved: string | null = null;

function read() {
  try {
    return localStorage.getItem(sitePresetKey) ?? unsaved;
  } catch {
    return unsaved;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === sitePresetKey || event.key === null) onChange();
  };
  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Keeps the choice for the whole site, and tells this document and the site's others (its iframes, other tabs). */
export function saveSitePreset(choice: PresetChoice) {
  unsaved = JSON.stringify(storedPreset(choice));
  try {
    localStorage.setItem(sitePresetKey, unsaved);
  } catch {}
  window.dispatchEvent(new Event(changeEvent));
}

/** The preset the visitor picked for the whole site: the Default until they pick one. */
export function useSitePreset(): [PresetChoice, (choice: PresetChoice) => void] {
  const stored = React.useSyncExternalStore(subscribe, read, () => null);
  const choice = React.useMemo(() => readStoredChoice(stored), [stored]);
  return [choice, saveSitePreset];
}

/** The inline head script that writes the stored preset's CSS before the first paint. */
export function SitePresetScript() {
  return <script dangerouslySetInnerHTML={{ __html: sitePresetScript }} />;
}

/**
 * Keeps the document's preset CSS equal to the stored choice: after a change here or in another document of the site,
 * and on load, where the CSS the head script trusted may be from an older version of a preset.
 */
export function SitePresetSync() {
  const stored = React.useSyncExternalStore(subscribe, read, () => null);
  React.useEffect(() => {
    // Read the store itself: while hydrating, `stored` still holds the server's empty value.
    const css = sitePresetCss(readStoredChoice(read()));
    const existing = document.getElementById(sitePresetStyleId);
    if ((existing?.textContent ?? '') === css) return;
    withoutTransitions(() => {
      const style = existing ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: sitePresetStyleId }));
      style.textContent = css;
    });
  }, [stored]);
  return null;
}

/** Applies a preset change in one frame, as next-themes' `disableTransitionOnChange` does for the theme. */
export function withoutTransitions(change: () => void, doc: Document = document) {
  const style = doc.createElement('style');
  // The picker's own switch and sliding thumbs keep their motion, or the control that made the change would jump.
  style.textContent =
    ":not([data-slot='switch'],[data-slot='switch-thumb'],[data-slot='segmented-control-thumb']),*::before,*::after{transition:none!important}";
  doc.head.appendChild(style);
  change();
  // Reading a computed style flushes the change before the override is removed.
  doc.defaultView?.getComputedStyle(doc.body).transition;
  doc.defaultView?.requestAnimationFrame(() => style.remove());
}
