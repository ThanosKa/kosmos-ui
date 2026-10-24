import type { Metadata, Viewport } from 'next';
import '../global.css';
import { getSearchLabels } from '@/components/site/search-index';
import { SiteProvider } from '@/components/site/site-provider';
import { tokenColors } from '@/components/site/token-colors';
import { htmlFontClassName } from '@/lib/fonts';
import { appDescription, appName, siteOpenGraph, siteUrl } from '@/lib/shared';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s · ${appName}` },
  description: appDescription,
  applicationName: appName,
  openGraph: siteOpenGraph,
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: tokenColors('light').background },
    { media: '(prefers-color-scheme: dark)', color: tokenColors('dark').background },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={htmlFontClassName} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen selection:bg-brand-selection selection:text-foreground">
        <SiteProvider searchLabels={getSearchLabels()}>{children}</SiteProvider>
      </body>
    </html>
  );
}
