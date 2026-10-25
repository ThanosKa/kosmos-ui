import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../global.css';
import { SitePresetScript, SitePresetSync } from '@/components/site/site-preset';
import { htmlFontClassName } from '@/lib/fonts';

export const metadata: Metadata = {
  robots: { index: false },
};

/** Root layout for preview routes: no site chrome, its own theme provider per page, and the site's preset. */
export default function ViewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={htmlFontClassName} suppressHydrationWarning>
      <head>
        <SitePresetScript />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <SitePresetSync />
        {children}
      </body>
    </html>
  );
}
