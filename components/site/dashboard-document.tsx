'use client';

import { ThemeProvider } from 'next-themes';
import { DashboardShowcase } from './dashboard-showcase';
import { usePreviewFrame } from './preset-frame';

/** The dashboard as a whole document, for the landing page's iframe. Like every preview route it takes the site's theme and preset. */
export function DashboardDocument() {
  const { ready, page, openPage } = usePreviewFrame('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <DashboardShowcase page={page} onPageChange={openPage} />
      <span data-preview-ready={ready ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
