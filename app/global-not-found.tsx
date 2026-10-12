import type { Metadata } from 'next';
import './global.css';
import { NotFoundPage } from '@/components/site/not-found-page';
import { getSearchLabels } from '@/components/site/search-index';
import { SiteProvider } from '@/components/site/site-provider';
import { htmlFontClassName } from '@/lib/fonts';
import { appName } from '@/lib/shared';

export const metadata: Metadata = { title: `Page not found · ${appName}` };

/** A URL no route matches. The site has two root layouts, so this page brings its own document and providers. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={htmlFontClassName} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <SiteProvider searchLabels={getSearchLabels()}>
          <NotFoundPage />
        </SiteProvider>
      </body>
    </html>
  );
}
