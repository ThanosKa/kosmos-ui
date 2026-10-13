'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { DashboardShowcase } from './dashboard-showcase';
import { readMessage, toLanding, landingSource, type DashboardLook, type LandingMessage } from './dashboard-look';

/**
 * The dashboard as a whole document, for the landing page's iframe. Until the landing sends a look it follows the
 * stored site theme, like any preview route; after that it takes the theme, accent and radius it is sent, on its own
 * `<html>`, so the landing page itself never changes.
 */
export function DashboardDocument() {
  const [look, setLook] = React.useState<DashboardLook | null>(null);
  const [page, setPage] = React.useState('overview');

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = readMessage<LandingMessage>(event, landingSource);
      if (!message) return;
      if (message.type === 'hello') toLanding({ type: 'ready' });
      else if (message.type === 'look') setLook(message.look);
      else setPage(message.page);
    };
    window.addEventListener('message', onMessage);
    toLanding({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (look) {
      root.dataset.accent = look.accent;
      root.dataset.radius = look.radius;
    }
  }, [look]);

  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange forcedTheme={look?.theme}>
      <DashboardShowcase
        page={page}
        onPageChange={(next) => {
          setPage(next);
          toLanding({ type: 'page', page: next });
        }}
      />
      <span data-dashboard-ready={look ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
