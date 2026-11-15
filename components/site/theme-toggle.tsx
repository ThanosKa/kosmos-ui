'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/registry/kosmos/ui/button';

const subscribe = () => () => {};

/**
 * Flips between light and dark. The theme is unknown on the server, so the name stays neutral until mounted.
 * The icons follow the `dark` class on `<html>`, so they are right before hydration too.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label={!mounted ? 'Switch theme' : dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="relative"
    >
      <Sun aria-hidden className="transition-[opacity] motion-safe:duration-base dark:opacity-0" />
      <Moon aria-hidden className="absolute opacity-0 transition-[opacity] motion-safe:duration-base dark:opacity-100" />
    </Button>
  );
}
