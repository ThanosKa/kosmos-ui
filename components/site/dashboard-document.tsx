'use client';

import { ThemeProvider } from 'next-themes';
import { DashboardShowcase } from './dashboard-showcase';
import { usePreviewFrame } from './preset-frame';

/**
 * The dashboard as a whole document, for the landing page's iframe. Until the landing sends its state it follows the
 * stored site theme, like any preview route; after that it takes the theme and preset it is sent, on its own
 * document, so the landing page itself never changes.
 */
export function DashboardDocument() {
  const { state, page, openPage } = usePreviewFrame('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange forcedTheme={state?.mode}>
      <DashboardShowcase page={page} onPageChange={openPage} />
      <span data-preview-ready={state ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
