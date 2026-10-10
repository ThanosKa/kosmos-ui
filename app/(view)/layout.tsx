import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../global.css';
import { htmlFontClassName } from '@/lib/fonts';

export const metadata: Metadata = {
  robots: { index: false },
};

/** Root layout for preview routes: no site chrome, its own theme provider per page. */
export default function ViewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={htmlFontClassName} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
