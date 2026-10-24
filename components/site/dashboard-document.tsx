'use client';

import { ThemeProvider } from 'next-themes';
import { DashboardShowcase } from './dashboard-showcase';
import { usePreviewFrame } from './preset-frame';

/**
 * The dashboard as a whole document, for the landing page's iframe. Until the landing sends its tokens it follows the
 * stored site theme, like any preview route; after that it takes the theme and preset it is sent, on its own
 * document, so the landing page itself never changes.
 */
export function DashboardDocument() {
  const { tokens, page, openPage } = usePreviewFrame('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange forcedTheme={tokens?.theme}>
      <DashboardShowcase page={page} onPageChange={openPage} />
      <span data-preview-ready={tokens ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
