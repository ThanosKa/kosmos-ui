import type { Metadata, Viewport } from 'next';
import './global.css';
import { NotFoundPage } from '@/components/site/not-found-page';
import { getSearchLabels } from '@/components/site/search-index';
import { SitePresetScript, SitePresetSync } from '@/components/site/site-preset';
import { SiteProvider } from '@/components/site/site-provider';
import { tokenColors } from '@/components/site/token-colors';
import { htmlFontClassName } from '@/lib/fonts';
import { appName } from '@/lib/shared';

export const metadata: Metadata = { title: `Page not found · ${appName}` };

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: tokenColors('light').background },
    { media: '(prefers-color-scheme: dark)', color: tokenColors('dark').background },
  ],
};

/** A URL no route matches. The site has two root layouts, so this page brings its own document and providers. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${htmlFontClassName} [-webkit-tap-highlight-color:transparent]`} suppressHydrationWarning>
      <head>
        <SitePresetScript />
      </head>
      <body className="flex flex-col min-h-svh">
        <SitePresetSync />
        <SiteProvider searchLabels={getSearchLabels()}>
          <NotFoundPage />
        </SiteProvider>
      </body>
    </html>
  );
}
