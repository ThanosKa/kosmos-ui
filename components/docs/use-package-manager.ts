'use client';

import { useCallback, useSyncExternalStore } from 'react';

const storageKey = 'package-manager';
const changeEvent = 'kosmos:package-manager';
/** The choice for this page view when storage is blocked. */
let unsaved: string | null = null;

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function read() {
  try {
    return localStorage.getItem(storageKey) ?? unsaved;
  } catch {
    return unsaved;
  }
}

/**
 * The package manager the visitor last picked, shared by every install tab and the install chip, on this page,
 * in other tabs and on later visits. `managers[0]` is the default and the server value.
 */
export function usePackageManager<T extends string>(managers: readonly T[]) {
  const saved = useSyncExternalStore(subscribe, read, () => null);
  const manager = managers.find((candidate) => candidate === saved) ?? managers[0];
  const setManager = useCallback((next: T) => {
    unsaved = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {}
    window.dispatchEvent(new Event(changeEvent));
  }, []);
  return [manager, setManager] as const;
}
