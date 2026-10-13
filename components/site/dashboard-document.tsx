'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { DashboardShowcase } from './dashboard-showcase';
import { readMessage, toLanding, landingSource, type DashboardTokens, type LandingMessage } from './dashboard-tokens';

/**
 * The dashboard as a whole document, for the landing page's iframe. Until the landing sends its tokens it follows the
 * stored site theme, like any preview route; after that it takes the theme, accent and radius it is sent, on its own
 * `<html>`, so the landing page itself never changes.
 */
export function DashboardDocument() {
  const [tokens, setTokens] = React.useState<DashboardTokens | null>(null);
  const [page, setPage] = React.useState('overview');

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = readMessage<LandingMessage>(event, landingSource);
      if (!message) return;
      if (message.type === 'hello') toLanding({ type: 'ready' });
      else if (message.type === 'tokens') setTokens(message.tokens);
      else setPage(message.page);
    };
    window.addEventListener('message', onMessage);
    toLanding({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    if (!tokens) return;
    withoutTransitions(() => {
      const root = document.documentElement;
      root.dataset.accent = tokens.accent;
      root.dataset.radius = tokens.radius;
    });
  }, [tokens]);

  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange forcedTheme={tokens?.theme}>
      <DashboardShowcase
        page={page}
        onPageChange={(next) => {
          setPage(next);
          toLanding({ type: 'page', page: next });
        }}
      />
      <span data-dashboard-ready={tokens ? '' : undefined} hidden />
    </ThemeProvider>
  );
}

/** Applies a token change in one frame, as `disableTransitionOnChange` does for the theme. */
function withoutTransitions(change: () => void) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  change();
  // Reading a computed style flushes the change before the override is removed.
  window.getComputedStyle(document.body).transition;
  requestAnimationFrame(() => style.remove());
}
