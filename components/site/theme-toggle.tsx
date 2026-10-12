'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/registry/kosmos/ui/button';

/**
 * Switches between light and dark. Before hydration the theme is unknown, so both icons render and CSS
 * shows the one for the current class on `<html>`; the label names the action, not the state.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun aria-hidden className="dark:hidden" />
      <Moon aria-hidden className="hidden dark:block" />
    </Button>
  );
}
