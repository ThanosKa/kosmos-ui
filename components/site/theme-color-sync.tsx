'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const schemeColors = new Map<string, string>();

/**
 * The browser bar takes its color from the `theme-color` meta that matches the system scheme. A theme picked on the
 * site can differ from it, so both metas take the color of the theme shown.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][media]');
    for (const meta of metas) {
      const scheme = /prefers-color-scheme:\s*(light|dark)/.exec(meta.media)?.[1];
      if (scheme && !schemeColors.has(scheme)) schemeColors.set(scheme, meta.content);
    }
    const color = resolvedTheme ? schemeColors.get(resolvedTheme) : undefined;
    if (!color) return;
    for (const meta of metas) meta.content = color;
  }, [resolvedTheme, pathname]);

  return null;
}
